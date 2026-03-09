import { useEffect } from 'react';

interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

function getMeta(property: string): string {
  return (
    document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content ??
    document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)?.content ??
    ''
  );
}

function setMeta(property: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`) ??
           document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    const attr = property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name';
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * Dynamically updates page title and meta tags, then restores originals on unmount.
 * Use inside CarDetailsModal or any route-level component.
 */
export function useMeta({ title, description, image, url }: MetaProps) {
  useEffect(() => {
    const prev = {
      title: document.title,
      description: getMeta('description'),
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image'),
      ogUrl: getMeta('og:url'),
      twitterTitle: getMeta('twitter:title'),
      twitterDescription: getMeta('twitter:description'),
      twitterImage: getMeta('twitter:image'),
    };

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:url', url ?? window.location.href);
    if (image) {
      setMeta('og:image', image);
      setMeta('twitter:image', image);
    }
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    return () => {
      document.title = prev.title;
      setMeta('description', prev.description);
      setMeta('og:title', prev.ogTitle);
      setMeta('og:description', prev.ogDescription);
      if (image) {
        setMeta('og:image', prev.ogImage);
        setMeta('twitter:image', prev.twitterImage);
      }
      setMeta('og:url', prev.ogUrl);
      setMeta('twitter:title', prev.twitterTitle);
      setMeta('twitter:description', prev.twitterDescription);
    };
  }, [title, description, image, url]);
}
