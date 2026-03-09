import { useEffect } from 'react';

/**
 * Injects a JSON-LD <script> into document.head and removes it on unmount.
 * Pass a stable object reference (useMemo) to avoid unnecessary re-injections.
 */
export function useJsonLd(schema: object) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `jsonld-${(schema as Record<string, string>)['@type'] ?? 'schema'}`;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(schema)]);
}
