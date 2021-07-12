import { NamespaceAliaser, NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { immediateRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxGlobals } from '@proc7ts/context-values';
import { drekContextOf } from './context-of';
import { DocumentRenderKit } from './document-render-kit';

describe('DocumentRenderKit', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  let cxBuilder: CxBuilder;
  let nsAlias: NamespaceAliaser;
  let scheduler: RenderScheduler;
  let renderKit: DocumentRenderKit;

  beforeEach(() => {
    cxBuilder = new CxBuilder(get => ({ get }));

    nsAlias = jest.fn(newNamespaceAliaser());
    scheduler = jest.fn(immediateRenderScheduler);
    cxBuilder.provide(cxConstAsset(CxGlobals, cxBuilder.context));
    cxBuilder.provide(cxConstAsset(NamespaceAliaser, nsAlias));
    cxBuilder.provide(cxConstAsset(RenderScheduler, scheduler));
    renderKit = cxBuilder.get(DocumentRenderKit);
  });

  it('initializes document rendering context with `NamespaceAliaser`', () => {

    const drCtx = renderKit.contextOf(doc.createElement('div'));
    const ns = new NamespaceDef('uri:test:ns');

    drCtx.nsAlias(ns);
    expect(nsAlias).toHaveBeenCalledWith(ns);
  });
  it('initializes document rendering context with global `RenderScheduler`', () => {

    const drCtx = renderKit.contextOf(doc.createElement('div'));

    drCtx.scheduler();
    expect(scheduler).toHaveBeenCalledTimes(1);
  });
  it('initializes document rendering context only once', () => {
    renderKit.contextOf(doc.createElement('div'));

    const newNsAlias = jest.fn(newNamespaceAliaser());

    drekContextOf(doc).update({ nsAlias: newNsAlias });

    const drCtx = renderKit.contextOf(doc);
    const ns = new NamespaceDef('uri:test:ns');

    drCtx.nsAlias(ns);
    expect(newNsAlias).toHaveBeenCalledWith(ns);
    expect(nsAlias).not.toHaveBeenCalled();
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(DocumentRenderKit)).toBe('[DocumentRenderKit]');
    });
  });
});
