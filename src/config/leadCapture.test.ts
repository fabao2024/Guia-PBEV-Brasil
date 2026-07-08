import { LEAD_CAPTURE_ENABLED } from './leadCapture';

describe('lead capture rollout flag', () => {
  it('keeps public lead capture disabled until partner onboarding is approved', () => {
    expect(LEAD_CAPTURE_ENABLED).toBe(false);
  });
});
