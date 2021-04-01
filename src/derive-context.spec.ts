import { NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { immediateRenderScheduler } from '@frontmeans/render-scheduler';
import { DrekContext } from './context';
import { drekContextOf } from './context-of';
import { deriveDrekContext } from './derive-context';

describe('deriveDrekContext', () => {

  let doc: Document;
  let element: Element;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    element = doc.createElement('element');
  });

  let base: DrekContext;

  beforeEach(() => {
    base = drekContextOf(element);
  });

  it('derives namespace aliaser', () => {

    const nsAlias = jest.fn(newNamespaceAliaser());

    drekContextOf(doc).update({ nsAlias });

    const context = deriveDrekContext(base);
    const ns = new NamespaceDef('uri:test:ns');

    context.nsAlias(ns);
    expect(nsAlias).toHaveBeenCalledWith(ns);
  });
  it('updates namespace aliaser', () => {

    const nsAlias = jest.fn(newNamespaceAliaser());
    const derived = deriveDrekContext(base, { nsAlias });
    const ns = new NamespaceDef('http://test');

    derived.nsAlias(ns);
    expect(nsAlias).toHaveBeenCalledWith(ns);
  });
  it('derives render scheduler', () => {

    const scheduler = jest.fn(immediateRenderScheduler);

    drekContextOf(doc).update({ scheduler });

    const context = deriveDrekContext(base);

    context.scheduler();
    expect(scheduler).toHaveBeenCalledTimes(1);
  });
  it('updates render scheduler', () => {

    const scheduler = jest.fn(immediateRenderScheduler);
    const context = deriveDrekContext(base, { scheduler });

    context.scheduler();
    expect(scheduler).toHaveBeenCalledTimes(1);
  });
  it('derives everything else', () => {

    const derived = deriveDrekContext(base);

    expect(derived.window).toBe(base.window);
    expect(derived.document).toBe(base.document);
    expect(derived.readStatus).toBe(base.readStatus);
  });

  describe('lift', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = deriveDrekContext(base);
    });

    it('returns itself if not lifted', () => {
      expect(context.lift()).toBe(context);
    });
    it('returns the context it is lifted to', () => {
      doc.body.appendChild(element);
      expect(context.lift()).toBe(drekContextOf(element));
      expect(context.lift()).toBe(drekContextOf(element));
    });
  });
});
