import { describe, expect, it } from 'vitest';
import {
  getCarImageDimensions,
  isTrustedWikimediaUrl,
  resolveCarImageSrcSet,
  resolveCarImageUrl,
} from '../imageUrl';

describe('car image URL security', () => {
  it('trusts only HTTPS wikimedia.org hosts and subdomains', () => {
    expect(isTrustedWikimediaUrl('https://upload.wikimedia.org/photo.jpg')).toBe(true);
    expect(isTrustedWikimediaUrl('https://commons.wikimedia.org/wiki/File:EV.jpg')).toBe(true);
    expect(isTrustedWikimediaUrl('http://upload.wikimedia.org/photo.jpg')).toBe(false);
    expect(isTrustedWikimediaUrl('https://wikimedia.org.evil.example/photo.jpg')).toBe(false);
    expect(isTrustedWikimediaUrl('https://evil.example/path/wikimedia.org/photo.jpg')).toBe(false);
    expect(isTrustedWikimediaUrl('https://wikimedia.org@evil.example/photo.jpg')).toBe(false);
  });

  it('resolves local images and proxies other HTTP origins', () => {
    expect(resolveCarImageUrl('/car-images/test.webp', 800, '/Guia-PBEV-Brasil/'))
      .toBe('/Guia-PBEV-Brasil/car-images/test.webp');
    expect(resolveCarImageUrl('https://cdn.example.com/ev.jpg', 400, '/'))
      .toBe('https://images.weserv.nl/?url=cdn.example.com%2Fev.jpg&w=400&q=80&output=webp');
  });

  it('fails closed for non-HTTP protocols and path traversal', () => {
    expect(resolveCarImageUrl('javascript:alert(1)', 800, '/')).toBe('');
    expect(resolveCarImageUrl('/car-images/../../private.txt', 800, '/')).toBe('');
  });
});

describe('optimized local car images', () => {
  const dolphin = '/car-images/dolphin-mini.png';

  it.each([
    [200, 320],
    [320, 320],
    [321, 640],
    [640, 640],
    [800, 960],
    [960, 960],
    [1200, 1280],
    [5000, 1280],
  ])('selects an existing variant for requested width %i', (width, expected) => {
    expect(resolveCarImageUrl(dolphin, width, '/'))
      .toBe(`/car-images/optimized/dolphin-mini.png-${expected}.webp`);
  });

  it('never invents an upscaled variant for a smaller original', () => {
    expect(resolveCarImageUrl('/car-images/e-js1.png', 1280, '/'))
      .toBe('/car-images/optimized/e-js1.png-1000.webp');
    expect(resolveCarImageUrl('/car-images/jac-ejv55.webp', 800, '/'))
      .toBe('/car-images/optimized/jac-ejv55.webp-960.webp');
  });

  it.each([NaN, Infinity, -Infinity, 0, -1])('uses a finite default for invalid width %s', (width) => {
    expect(resolveCarImageUrl(dolphin, width, '/'))
      .toBe('/car-images/optimized/dolphin-mini.png-960.webp');
    expect(resolveCarImageUrl('https://cdn.example.com/ev.jpg', width, '/'))
      .toContain('&w=800&');
  });

  it('honors the application base URL for src and every srcSet entry', () => {
    expect(resolveCarImageUrl(dolphin, 400, '/Guia-PBEV-Brasil/'))
      .toBe('/Guia-PBEV-Brasil/car-images/optimized/dolphin-mini.png-640.webp');
    expect(resolveCarImageSrcSet(dolphin, '/Guia-PBEV-Brasil/')).toBe(
      [320, 640, 960, 1280]
        .map((width) => `/Guia-PBEV-Brasil/car-images/optimized/dolphin-mini.png-${width}.webp ${width}w`)
        .join(', '),
    );
  });

  it('uses the Vite base URL by default', () => {
    expect(resolveCarImageUrl(dolphin, 320))
      .toBe(`${import.meta.env.BASE_URL}car-images/optimized/dolphin-mini.png-320.webp`);
    expect(resolveCarImageSrcSet(dolphin))
      .toContain(`${import.meta.env.BASE_URL}car-images/optimized/dolphin-mini.png-320.webp 320w`);
  });

  it('returns the original aspect-ratio dimensions without inventing external metadata', () => {
    expect(getCarImageDimensions(dolphin)).toEqual({ width: 3235, height: 1910 });
    expect(getCarImageDimensions('/car-images/e-js1.png')).toEqual({ width: 1000, height: 750 });
    expect(getCarImageDimensions('/car-images/jac-ejv55.webp')).toEqual({ width: 1920, height: 1080 });
  });

  it.each([
    '/car-images/unmapped.jpg',
    '/car-images/cooper-e.avif',
    '/car-images/dolphin-mini.png?version=2',
    '/car-images/../../private.txt',
    'https://cdn.example.com/ev.jpg',
    'https://upload.wikimedia.org/photo.jpg',
    'javascript:alert(1)',
    '',
  ])('omits responsive metadata when no approved variant is mapped: %s', (image) => {
    expect(resolveCarImageSrcSet(image, '/')).toBeUndefined();
    expect(getCarImageDimensions(image)).toBeUndefined();
  });

  it('keeps unmapped local images and trusted external originals working', () => {
    const local = '/car-images/cooper-e.avif';
    expect(resolveCarImageUrl(local, 320, '/app/')).toBe(`/app${local}`);
    const wikimedia = 'https://upload.wikimedia.org/photo.jpg';
    expect(resolveCarImageUrl(wikimedia, 320, '/')).toBe(wikimedia);
  });
});
