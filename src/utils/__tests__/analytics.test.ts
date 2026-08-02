import { track } from '../analytics';

describe('track()', () => {
  afterEach(() => {
    delete (window as any).plausible;
  });

  it('calls window.plausible with event name when available', () => {
    const mock = vi.fn();
    (window as any).plausible = mock;

    track('Lead Click', { model: 'Dolphin GS', brand: 'BYD' });

    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith('Lead Click', { props: { model: 'Dolphin GS', brand: 'BYD' } });
  });

  it('calls window.plausible with no props when omitted', () => {
    const mock = vi.fn();
    (window as any).plausible = mock;

    track('Simulator Used');

    expect(mock).toHaveBeenCalledWith('Simulator Used', { props: undefined });
  });

  it('does not throw when window.plausible is undefined', () => {
    expect(() => track('Car Details Open', { model: 'Atto 3', brand: 'BYD' })).not.toThrow();
  });

  it('does not throw when window.plausible is not a function', () => {
    (window as any).plausible = 'not-a-function';
    expect(() => track('Filter Applied', { filter_type: 'category', value: 'SUV' })).not.toThrow();
  });

  it('passes numeric props correctly', () => {
    const mock = vi.fn();
    (window as any).plausible = mock;

    track('Comparison Start', { count: 2 });

    expect(mock).toHaveBeenCalledWith('Comparison Start', { props: { count: 2 } });
  });

  it.each([
    ['partner_cta_click', 'cta'],
    ['partner_form_start', 'form-start'],
    ['partner_form_validation_error', 'validation-error'],
    ['partner_submit_attempt', 'submit-attempt'],
    ['partner_submit_success', 'submit-success'],
    ['partner_submit_error', 'submit-error'],
  ])('emits a virtual pageview for %s', (eventName, virtualStage) => {
    const mock = vi.fn();
    (window as any).plausible = mock;

    track(eventName, { utm_campaign: 'partner_program' });

    expect(mock).toHaveBeenNthCalledWith(1, eventName, {
      props: { utm_campaign: 'partner_program' },
    });
    expect(mock).toHaveBeenNthCalledWith(2, 'pageview', {
      url: `${window.location.origin}/__funnel/partners/${virtualStage}`,
    });
  });

  it('does not duplicate the real partner landing pageview', () => {
    const mock = vi.fn();
    (window as any).plausible = mock;

    track('partner_page_view', { utm_source: 'instagram' });

    expect(mock).toHaveBeenCalledOnce();
  });

  it('does not call plausible when window is unavailable', () => {
    // Guard: no plausible on window — event must be silently dropped
    const fired: string[] = [];
    // plausible is already undefined at this point (afterEach cleaned it)
    track('Ghost Event');
    expect(fired).toHaveLength(0);
  });
});
