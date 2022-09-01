import { newNamespaceAliaser, XHTML__NS } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, setRenderScheduler } from '@frontmeans/render-scheduler';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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
      const { nsAlias } = drekContextOf(doc).update({ nsAlias: customNsAlias });

      nsAlias(XHTML__NS);

      expect(customNsAlias).toHaveBeenCalledWith(XHTML__NS);
    });
    it('can be updated', () => {
      const { nsAlias } = drekContextOf(doc);
      const customNsAlias = jest.fn(newNamespaceAliaser());

      drekContextOf(doc).update({ nsAlias: customNsAlias });
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
      const { scheduler } = drekContextOf(doc).update({ scheduler: customScheduler });
      const node = doc.createElement('span');

      scheduler({ node });

      expect(customScheduler).toHaveBeenCalledWith({ window, node });
    });
    it('can be updated', () => {
      const { scheduler } = drekContextOf(doc);
      const customScheduler = jest.fn(newManualRenderScheduler());

      drekContextOf(doc).update({ scheduler: customScheduler });

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
});
