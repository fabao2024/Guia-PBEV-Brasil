declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function track(event: string, props?: Record<string, string | number>): void {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(event, { props });
  }
}
