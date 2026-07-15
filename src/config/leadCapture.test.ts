describe('lead capture rollout flag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('keeps public lead capture disabled by default', async () => {
    const { LEAD_CAPTURE_ENABLED } = await import('./leadCapture');
    expect(LEAD_CAPTURE_ENABLED).toBe(false);
  });

  it('enables public lead capture only when the build flag is explicitly true', async () => {
    vi.stubEnv('VITE_ENABLE_LEAD_CAPTURE', 'true');
    const { LEAD_CAPTURE_ENABLED } = await import('./leadCapture');
    expect(LEAD_CAPTURE_ENABLED).toBe(true);
  });
});
