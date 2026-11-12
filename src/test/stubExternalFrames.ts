import { afterAll, beforeAll, vi } from 'vitest';

/** Keep real iframe attributes/events, but use an empty local document in unit tests.
 * Actual third-party rendering is checked separately in a browser.
 */
export function stubExternalFrames() {
  let restore: () => void;
  beforeAll(() => {
    const createElement = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = createElement(tag, options);
      if (tag.toLowerCase() === 'iframe') element.setAttribute('srcdoc', '');
      return element;
    });
    restore = () => spy.mockRestore();
  });
  afterAll(() => restore());
}
