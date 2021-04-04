import { documentOf } from './document-of';

describe('documentOf', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  it('returns owner document', () => {
    expect(documentOf(doc.createElement('div'))).toBe(doc);
    expect(documentOf(doc.createTextNode('test'))).toBe(doc);
    expect(documentOf(doc.createComment('test'))).toBe(doc);
  });
  it('returns the document itself', () => {
    expect(documentOf(doc)).toBe(doc);
  });
});
