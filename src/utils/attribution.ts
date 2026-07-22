export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  landingPath: string;
}

export const ATTRIBUTION_STORAGE_KEY = 'pbev_first_touch_v1';

const SOURCE_ALIASES: Record<string, string> = {
  ig: 'instagram',
  instagram: 'instagram',
  fb: 'facebook',
  facebook: 'facebook',
};

function sanitize(value: string | null, maxLength = 120): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().slice(0, maxLength).replace(/[^a-zA-Z0-9_.-]/g, '_');
  return clean || undefined;
}

function normalizeSource(value: string | null): string | undefined {
  const clean = sanitize(value)?.toLowerCase();
  return clean ? SOURCE_ALIASES[clean] || clean : undefined;
}

function safeLandingPath(pathname: string): string {
  if (!pathname.startsWith('/')) return '/';
  return pathname.slice(0, 200) || '/';
}

function readStored(): AttributionData | null {
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AttributionData>;
    if (typeof parsed.landingPath !== 'string' || !parsed.landingPath.startsWith('/')) return null;
    return {
      utmSource: normalizeSource(parsed.utmSource || null),
      utmMedium: sanitize(parsed.utmMedium || null),
      utmCampaign: sanitize(parsed.utmCampaign || null),
      utmContent: sanitize(parsed.utmContent || null),
      landingPath: safeLandingPath(parsed.landingPath),
    };
  } catch {
    return null;
  }
}

export function getFirstTouchAttribution(): AttributionData {
  if (typeof window === 'undefined') return { landingPath: '/' };

  const stored = readStored();
  if (stored) return stored;

  // A legacy Meta profile link used "~and~" instead of "&". Repair it locally
  // while only reading an allowlist of UTM fields.
  const repairedQuery = window.location.search.replace(/~and~/gi, '&');
  const params = new URLSearchParams(repairedQuery);
  const attribution: AttributionData = {
    utmSource: normalizeSource(params.get('utm_source')),
    utmMedium: sanitize(params.get('utm_medium')),
    utmCampaign: sanitize(params.get('utm_campaign')),
    utmContent: sanitize(params.get('utm_content')),
    landingPath: safeLandingPath(window.location.pathname),
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution must never block a conversion when storage is unavailable.
  }
  return attribution;
}

export function attributionEventProps(attribution = getFirstTouchAttribution()): Record<string, string | undefined> {
  return {
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_content: attribution.utmContent,
    landing_path: attribution.landingPath,
  };
}
