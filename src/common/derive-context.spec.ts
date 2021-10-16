import { NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { immediateRenderScheduler } from '@frontmeans/render-scheduler';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
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

    const context = deriveDrekContext(base, { scheduler: immediateRenderScheduler });
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
    expect(derived.window).toBe(base.window);
    expect(derived.document).toBe(base.document);
    expect(derived.readStatus).toBe(base.readStatus);
  });
  it('derives render scheduler', () => {

    const scheduler = jest.fn(immediateRenderScheduler);

    drekContextOf(doc).update({ scheduler });

    const context = deriveDrekContext(base, { nsAlias: newNamespaceAliaser() });

    context.scheduler();
    expect(scheduler).toHaveBeenCalledTimes(1);
  });
  it('updates render scheduler', () => {

    const scheduler = jest.fn(immediateRenderScheduler);
    const derived = deriveDrekContext(base, { scheduler });

    derived.scheduler();
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(derived.window).toBe(base.window);
    expect(derived.document).toBe(base.document);
    expect(derived.readStatus).toBe(base.readStatus);
  });
  it('returns the base context without update', () => {
    expect(deriveDrekContext(base)).toBe(base);
    expect(deriveDrekContext(base, {})).toBe(base);
    expect(deriveDrekContext(base, { nsAlias: base.nsAlias, scheduler: base.scheduler })).toBe(base);
  });

  describe('lift', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = deriveDrekContext(base, { nsAlias: newNamespaceAliaser() });
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
