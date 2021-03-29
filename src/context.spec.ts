import { newNamespaceAliaser, XHTML__NS } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, setRenderScheduler } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { DrekContext } from './context';
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';

describe('DrekContext', () => {

  let doc: Document;
  let element: Element;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    element = doc.body.appendChild(doc.createElement('span'));
  });

  describe('of', () => {
    it('obtains a rendering context of the document', () => {

      const context = DrekContext.of(doc);

      expect(context).toBeInstanceOf(DrekContext);
      expect(context.window).toBe(window);
      expect(context.document).toBe(doc);
    });
    it('caches rendering context in document', () => {
      expect(DrekContext.of(doc)).toBe(DrekContext.of(doc));
    });
    it('obtains rendering context from element', () => {
      expect(DrekContext.of(element)).toBe(DrekContext.of(doc));
    });
    it('obtains rendering context from document fragment', () => {

      const fragment = doc.createDocumentFragment();

      expect(DrekContext.of(fragment)).toBe(DrekContext.of(doc));
    });
  });

  describe('nsAlias', () => {
    it('can be specified', () => {

      const customNsAlias = jest.fn(newNamespaceAliaser());
      const { nsAlias } = DrekContext.of(doc, { nsAlias: customNsAlias });

      nsAlias(XHTML__NS);

      expect(customNsAlias).toHaveBeenCalledWith(XHTML__NS);
    });
    it('can be updated', () => {

      const { nsAlias } = DrekContext.of(doc);
      const customNsAlias = jest.fn(newNamespaceAliaser());

      DrekContext.of(doc, { nsAlias: customNsAlias });
      nsAlias(XHTML__NS);

      expect(customNsAlias).toHaveBeenCalledWith(XHTML__NS);
    });
  });

  describe('scheduler', () => {
    afterEach(() => {
      delete (document as DrekContext$Holder<Document>)[DrekContext__symbol];
      setRenderScheduler();
    });

    it('specifies schedule window', () => {

      const scheduler = jest.fn(newManualRenderScheduler());

      setRenderScheduler(scheduler);

      const span = document.createElement('span');

      DrekContext.of(span).scheduler({ node: span });

      expect(scheduler).toHaveBeenCalledWith({ window, node: span });
    });
    it('can be specified', () => {

      const customScheduler = jest.fn(newManualRenderScheduler());
      const { scheduler } = DrekContext.of(doc, { scheduler: customScheduler });
      const node = doc.createElement('span');

      scheduler({ node });

      expect(customScheduler).toHaveBeenCalledWith({ window, node });
    });
    it('can be updated', () => {

      const { scheduler } = DrekContext.of(doc);
      const customScheduler = jest.fn(newManualRenderScheduler());

      DrekContext.of(doc, { scheduler: customScheduler });

      const node = doc.createElement('span');

      scheduler({ node });

      expect(customScheduler).toHaveBeenCalledWith({ window, node });
    });
  });

  describe('onceConnected', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = DrekContext.of(doc);
    });

    it('always reports connected status', async () => {
      expect(await context.onceConnected).toEqual({ connected: true });
    });
    it('is cached', () => {
      expect(context.onceConnected).toBe(context.onceConnected);
    });
    it('does not cut off supply', () => {

      const supply = context.onceConnected(noop).supply;

      expect(supply.isOff).toBe(false);
      supply.off();
    });
  });

  describe('whenConnected', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = DrekContext.of(doc);
    });

    it('always reports connected status', async () => {
      expect(await context.whenConnected).toEqual({ connected: true });
    });
  });

  describe('whenSettled', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = DrekContext.of(doc);
    });

    it('is the same as `whenConnected`', () => {
      expect(context.whenSettled).toBe(context.whenConnected);
    });
  });

  describe('with', () => {

    let ancestor: DrekContext;

    beforeEach(() => {
      ancestor = DrekContext.of(doc);
    });

    it('updates namespace aliaser', () => {

      const nsAlias = newNamespaceAliaser();
      const derived = ancestor.with({ nsAlias });

      expect(derived.nsAlias).toBe(nsAlias);
    });
    it('updates render scheduler', () => {

      const scheduler = newManualRenderScheduler();
      const derived = ancestor.with({ scheduler });

      expect(derived.scheduler).toBe(scheduler);
    });
    it('derives everything else', () => {

      const derived = ancestor.with();

      expect(derived.window).toBe(ancestor.window);
      expect(derived.document).toBe(ancestor.document);
      expect(derived.nsAlias).toBe(ancestor.nsAlias);
      expect(derived.scheduler).toBe(ancestor.scheduler);
      expect(derived.readStatus).toBe(ancestor.readStatus);
    });
  });
});
