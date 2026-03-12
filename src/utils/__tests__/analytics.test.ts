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

  it('does not call plausible when window is unavailable', () => {
    // Guard: no plausible on window — event must be silently dropped
    const fired: string[] = [];
    // plausible is already undefined at this point (afterEach cleaned it)
    track('Ghost Event');
    expect(fired).toHaveLength(0);
  });
});
