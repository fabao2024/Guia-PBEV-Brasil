declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean | undefined> }) => void;
  }
}

export function track(event: string, props?: Record<string, string | number | boolean | undefined>): void {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    const cleanProps = props
      ? Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined && value !== ''))
      : undefined;
    window.plausible(event, { props: cleanProps });
  }
}
