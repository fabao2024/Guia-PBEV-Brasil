import { optimizedCarImages } from './carImageManifest';

export function isTrustedWikimediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === 'https:'
      && (hostname === 'wikimedia.org' || hostname.endsWith('.wikimedia.org'));
  } catch {
    return false;
  }
}

function imageMetadata(value: string) {
  return Object.prototype.hasOwnProperty.call(optimizedCarImages, value)
    ? optimizedCarImages[value] : undefined;
}

function withBase(src: string, baseUrl: string): string {
  return `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${src.substring(1)}`;
}

/** Only known, generated assets receive responsive metadata. */
export function getCarImageDimensions(value: string): { width: number; height: number } | undefined {
  const image = imageMetadata(value);
  return image ? { width: image.width, height: image.height } : undefined;
}

export function resolveCarImageSrcSet(value: string, baseUrl: string = import.meta.env.BASE_URL): string | undefined {
  return imageMetadata(value)?.variants.map(image => `${withBase(image.src, baseUrl)} ${image.width}w`).join(', ');
}

export function resolveCarImageUrl(
  value: string,
  width: number,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const requestedWidth = Number.isFinite(width) && width > 0 ? Math.round(width) : 800;
  if (value.startsWith('/car-images/')) {
    if (value.includes('..')) return '';
    const image = imageMetadata(value);
    if (image) {
      const variant = image.variants.find(item => item.width >= requestedWidth)
        ?? image.variants[image.variants.length - 1];
      return withBase(variant.src, baseUrl);
    }
    return withBase(value, baseUrl);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return '';
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  if (isTrustedWikimediaUrl(url.href)) return url.href;

  const safeWidth = Math.max(100, Math.min(1600, requestedWidth));
  const upstream = url.href.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(upstream)}&w=${safeWidth}&q=80&output=webp`;
}
