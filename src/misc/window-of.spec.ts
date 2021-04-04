import { windowOf } from './window-of';

describe('windowOf', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  it('returns the default view of the document', () => {
    expect(windowOf(document.createElement('test'))).toBe(window);
  });
  it('returns the `window` instance when there is nmo default view', () => {
    expect(windowOf(doc.createElement('test'))).toBe(window);
  });
});
