import { ATTRIBUTION_STORAGE_KEY, getFirstTouchAttribution } from '../attribution';

describe('first-touch attribution', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/parceiros');
  });

  it('normalizes social aliases and keeps only allowlisted campaign fields', () => {
    window.history.replaceState(
      {},
      '',
      '/parceiros?utm_source=ig&utm_medium=paid_social&utm_campaign=partner_wallbox_sp&utm_content=reel_v1&name=Maria&phone=11999999999',
    );

    expect(getFirstTouchAttribution()).toEqual({
      utmSource: 'instagram',
      utmMedium: 'paid_social',
      utmCampaign: 'partner_wallbox_sp',
      utmContent: 'reel_v1',
      landingPath: '/parceiros',
    });
    expect(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).not.toContain('Maria');
    expect(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)).not.toContain('11999999999');
  });

  it('repairs legacy ~and~ separators and preserves the first touch', () => {
    window.history.replaceState(
      {},
      '',
      '/parceiros?utm_source=fb~and~utm_medium=social~and~utm_campaign=partner_program',
    );
    const first = getFirstTouchAttribution();

    window.history.replaceState({}, '', '/interesse?utm_source=instagram&utm_campaign=second_touch');

    expect(first).toEqual({
      utmSource: 'facebook',
      utmMedium: 'social',
      utmCampaign: 'partner_program',
      landingPath: '/parceiros',
    });
    expect(getFirstTouchAttribution()).toEqual(first);
  });
});
