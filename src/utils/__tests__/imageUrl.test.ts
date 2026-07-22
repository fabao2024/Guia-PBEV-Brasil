import { describe, expect, it } from 'vitest';
import { isTrustedWikimediaUrl, resolveCarImageUrl } from '../imageUrl';

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
