// Public lead capture stays disabled unless the production build explicitly opts in.
const rolloutFlag = String(import.meta.env.VITE_ENABLE_LEAD_CAPTURE ?? '').trim().toLowerCase();
export const LEAD_CAPTURE_ENABLED = rolloutFlag === 'true';

export function isLeadCapturePath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') === '/interesse';
}
