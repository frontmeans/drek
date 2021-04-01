import { newNamespaceAliaser, XHTML__NS } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, setRenderScheduler } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { DrekContext } from './context';
import { drekContextOf } from './context-of';
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';

describe('DrekContext', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  describe('nsAlias', () => {
    it('can be specified', () => {

      const customNsAlias = jest.fn(newNamespaceAliaser());
      const { nsAlias } = drekContextOf(doc, { nsAlias: customNsAlias });

      nsAlias(XHTML__NS);

      expect(customNsAlias).toHaveBeenCalledWith(XHTML__NS);
    });
    it('can be updated', () => {

      const { nsAlias } = drekContextOf(doc);
      const customNsAlias = jest.fn(newNamespaceAliaser());

      drekContextOf(doc, { nsAlias: customNsAlias });
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

      drekContextOf(span).scheduler({ node: span });

      expect(scheduler).toHaveBeenCalledWith({ window, node: span });
    });
    it('can be specified', () => {

      const customScheduler = jest.fn(newManualRenderScheduler());
      const { scheduler } = drekContextOf(doc, { scheduler: customScheduler });
      const node = doc.createElement('span');

      scheduler({ node });

      expect(customScheduler).toHaveBeenCalledWith({ window, node });
    });
    it('can be updated', () => {

      const { scheduler } = drekContextOf(doc);
      const customScheduler = jest.fn(newManualRenderScheduler());

      drekContextOf(doc, { scheduler: customScheduler });

      const node = doc.createElement('span');

      scheduler({ node });

      expect(customScheduler).toHaveBeenCalledWith({ window, node });
    });
  });

  describe('onceConnected', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = drekContextOf(doc);
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
      context = drekContextOf(doc);
    });

    it('always reports connected status', async () => {
      expect(await context.whenConnected).toEqual({ connected: true });
    });
  });

  describe('whenSettled', () => {

    let context: DrekContext;

    beforeEach(() => {
      context = drekContextOf(doc);
    });

    it('is the same as `whenConnected`', () => {
      expect(context.whenSettled).toBe(context.whenConnected);
    });
  });

  describe('with', () => {

    let ancestor: DrekContext;

    beforeEach(() => {
      ancestor = drekContextOf(doc);
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
