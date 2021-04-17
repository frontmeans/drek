import { drekContextOf } from '../context-of';
import { DrekFragment } from '../fragment';
import { drekAppender } from '../target';
import { drekHost } from './host';

describe('drekHost', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  it('is equal to node host by default', () => {
    expect(drekHost(doc.body)).toBe(doc.documentElement);
  });
  it('is equal to render host within rendered fragment', () => {

    const host = doc.createElement('div');
    const fragment = new DrekFragment(drekAppender(host));
    const node = fragment.content.appendChild(doc.createTextNode('test'));

    expect(drekHost(node)).toBe(host);
    expect(drekHost(fragment.content)).toBe(host);
  });
  it('is equal to the host of non-element render host within rendered fragment', () => {

    const host = doc.createDocumentFragment();
    const fragment = new DrekFragment(drekAppender(host));
    const node = fragment.content.appendChild(doc.createTextNode('test'));

    expect(drekHost(node)).toBeUndefined();
    expect(drekHost(fragment.content)).toBeUndefined();
  });
  it('is equal to render host deeply inside rendered fragment', () => {

    const host = doc.createElement('div');
    const fragment1 = new DrekFragment(drekAppender(host));
    const fragment2 = new DrekFragment(drekAppender(fragment1.content));
    const node = fragment2.content.appendChild(doc.createTextNode('test'));

    expect(drekHost(node)).toBe(host);
    expect(drekHost(fragment1.content)).toBe(host);
  });
  it('is undefined for document fragment', () => {

    const fragment = doc.createDocumentFragment();

    expect(drekHost(fragment)).toBeUndefined();
  });
  it('is undefined for disconnected element', () => {

    const element = doc.createElement('test-element');

    expect(drekHost(element)).toBeUndefined();
  });
  it('is undefined for disconnected element with rendering context attached', () => {

    const element = doc.createElement('test-element');

    drekContextOf(element); // Attach context

    expect(drekHost(element)).toBeUndefined();
  });
});
