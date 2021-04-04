import { parentElementOf } from './parent-element-of';

describe('parentElementOfOf', () => {
  it('returns parent element', () => {

    const parent = document.createElement('div');
    const child = parent.appendChild(document.createElement('span'));

    expect(parentElementOf(child)).toBe(parent);
  });
  it('crosses shadow root bounds', () => {

    const parent = document.createElement('div');
    const shadowRoot = parent.attachShadow({ mode: 'closed' });
    const child = shadowRoot.appendChild(document.createElement('span'));

    expect(parentElementOf(child)).toBe(parent);
  });
  it('returns `null` for detached element', () => {
    expect(parentElementOf(document.createElement('dev'))).toBeNull();
  });
  it('returns `null` for element inside document fragment', () => {

    const fragment = document.createDocumentFragment();
    const element = fragment.appendChild(document.createElement('div'));

    expect(parentElementOf(element)).toBeNull();
  });
  it('returns `null` for document element', () => {
    expect(parentElementOf(document.documentElement)).toBeNull();
  });
});
