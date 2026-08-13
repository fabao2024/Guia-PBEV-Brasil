declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: {
        props?: Record<string, string | number | boolean | undefined>;
        url?: string;
      },
    ) => void;
  }
}

const FUNNEL_VIRTUAL_PATHS: Record<string, string> = {
  partner_cta_click: '/__funnel/partners/cta',
  partner_form_start: '/__funnel/partners/form-start',
  partner_form_validation_error: '/__funnel/partners/validation-error',
  partner_submit_attempt: '/__funnel/partners/submit-attempt',
  partner_submit_success: '/__funnel/partners/submit-success',
  partner_submit_error: '/__funnel/partners/submit-error',
  lead_form_start: '/__funnel/leads/form-start',
  lead_form_validation_error: '/__funnel/leads/validation-error',
  lead_submit_attempt: '/__funnel/leads/submit-attempt',
  lead_success: '/__funnel/leads/submit-success',
  lead_error: '/__funnel/leads/submit-error',
};

export function track(
  eventName: string,
  props?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') return;

  const cleanProps = props
    ? Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined && value !== ''))
    : undefined;
  window.plausible(eventName, { props: cleanProps });

  const virtualPath = FUNNEL_VIRTUAL_PATHS[eventName];
  if (virtualPath) {
    window.plausible('pageview', { url: new URL(virtualPath, window.location.origin).href });
  }
}
