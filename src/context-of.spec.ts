import { DrekContext } from './context';
import { drekContextOf } from './context-of';

describe('drekContextOf', () => {

  let doc: Document;
  let element: Element;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    element = doc.body.appendChild(doc.createElement('span'));
  });

  it('obtains a rendering context of the document', () => {

    const context = drekContextOf(doc);

    expect(context).toBeInstanceOf(DrekContext);
    expect(context.window).toBe(window);
    expect(context.document).toBe(doc);
  });
  it('caches rendering context in document', () => {
    expect(drekContextOf(doc)).toBe(drekContextOf(doc));
  });
  it('obtains rendering context from element', () => {
    expect(drekContextOf(element)).toBe(drekContextOf(doc));
  });
  it('obtains rendering context from document fragment', () => {

    const fragment = doc.createDocumentFragment();

    expect(drekContextOf(fragment)).toBe(drekContextOf(doc));
  });

});
