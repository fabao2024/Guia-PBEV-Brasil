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

export function resolveCarImageUrl(
  value: string,
  width: number,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  if (value.startsWith('/car-images/')) {
    if (value.includes('..')) return '';
    return `${baseUrl}${value.substring(1)}`;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return '';
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  if (isTrustedWikimediaUrl(url.href)) return url.href;

  const safeWidth = Math.max(100, Math.min(1600, Math.round(width)));
  const upstream = url.href.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(upstream)}&w=${safeWidth}&q=80&output=webp`;
}
