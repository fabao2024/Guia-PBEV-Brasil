import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { optimizedCarImages } from '../carImageManifest';

type Asset = { src: string; width: number; height: number; bytes: number; sha256: string };
type Source = Asset & { alpha: boolean; variants: Asset[] };
const root = process.cwd();
const publicPath = (src: string) => path.join(root, 'public', src);
const audit = JSON.parse(readFileSync(publicPath('/car-images/optimized/manifest.json'), 'utf8')) as {
  generator: { thresholdBytes: number; widths: number[]; quality: number; method: number; alphaQuality: number };
  images: Source[];
};

function webpSize(buffer: Buffer): { width: number; height: number; alpha: boolean } {
  expect(buffer.subarray(0, 4).toString()).toBe('RIFF');
  expect(buffer.subarray(8, 12).toString()).toBe('WEBP');
  const chunk = buffer.subarray(12, 16).toString();
  if (chunk === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
      alpha: Boolean(buffer[20] & 0x10),
    };
  }
  expect(chunk).toBe('VP8 ');
  return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff, alpha: false };
}

function checkAsset(asset: Asset) {
  const buffer = readFileSync(publicPath(asset.src));
  expect(buffer.byteLength).toBe(asset.bytes);
  expect(createHash('sha256').update(buffer).digest('hex')).toBe(asset.sha256);
  return buffer;
}

describe('generated car image assets', () => {
  it('covers every local source above 200 kB, without replacing originals', () => {
    const heavy = readdirSync(publicPath('/car-images/'))
      .filter((name) => /\.(?:png|jpe?g|webp|avif)$/i.test(name))
      .map((name) => `/car-images/${name}`)
      .filter((src) => statSync(publicPath(src)).size > 200_000)
      .sort();
    expect(audit.generator).toMatchObject({
      thresholdBytes: 200_000,
      widths: [320, 640, 960, 1280],
      quality: 82,
      method: 6,
      alphaQuality: 100,
    });
    expect(audit.images.map((image) => image.src).sort()).toEqual(heavy);
    expect(Object.keys(optimizedCarImages).sort()).toEqual(heavy);
  });

  it('keeps the browser manifest consistent with original dimensions and actual assets', () => {
    for (const image of audit.images) {
      checkAsset(image);
      const runtime = optimizedCarImages[image.src];
      expect(runtime).toEqual({
        width: image.width,
        height: image.height,
        variants: image.variants.map(({ src, width, height }) => ({ src, width, height })),
      });
      const expectedWidths = [...new Set(audit.generator.widths.map((width) => Math.min(width, image.width)))];
      expect(image.variants.map((variant) => variant.width)).toEqual(expectedWidths);
      for (const variant of image.variants) {
        expect(variant.src).toMatch(/^\/car-images\/optimized\/[\w.-]+\.webp$/);
        expect(variant.bytes).toBeLessThan(image.bytes);
        expect(variant.width).toBeLessThanOrEqual(image.width);
        expect(variant.height).toBe(Math.max(1, Math.round(image.height * variant.width / image.width)));
        const decoded = webpSize(checkAsset(variant));
        expect(decoded).toEqual({ width: variant.width, height: variant.height, alpha: image.alpha });
      }
    }
  });

  it('keeps both expensive images below 100 kB at mobile-card resolution', () => {
    for (const src of ['/car-images/Dolphin-mini.png', '/car-images/e-js1.png']) {
      const image = audit.images.find((entry) => entry.src === src)!;
      // Cards up to 430 CSS px screens stay below 640 image px even at DPR 3.
      // The 960px asset is a larger/detail fallback, not this mobile budget.
      const variant = image.variants.find((entry) => entry.width === 640)!;
      expect(variant.bytes).toBeLessThan(100_000);
      expect(variant.bytes / image.bytes).toBeLessThan(0.1);
    }
  });
});
