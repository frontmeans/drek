import { NamespaceAliaser, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, setRenderScheduler } from '@frontmeans/render-scheduler';
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
    it('obtains rendering context from document', () => {
      expect(DrekContext.of(doc)).toEqual({
        nsAlias: expect.any(Function),
        scheduler: expect.any(Function),
      });
    });
    it('caches rendering context in document', () => {
      expect(DrekContext.of(doc)).toBe(DrekContext.of(doc));
    });
    it('obtains rendering context from element', () => {
      expect(DrekContext.of(element)).toBe(DrekContext.of(doc));
    });
  });

  describe('nsAlias', () => {
    it('respects default ns aliaser defaults', () => {

      const fallbackCtx = DrekContext.of(element);
      const nsAliaser = newNamespaceAliaser();
      const nsAlias: NamespaceAliaser = options => nsAliaser(options);

      expect(DrekContext.of(element, { nsAlias })).toEqual({
        nsAlias,
        scheduler: fallbackCtx.scheduler,
      });
    });
  });

  describe('scheduler', () => {
    afterEach(() => {
      delete (document as DrekContext$Holder<Document>)[DrekContext__symbol];
      setRenderScheduler();
    });

    it('respects default scheduler', () => {

      const fallbackCtx = DrekContext.of(element);
      const scheduler = newManualRenderScheduler();

      expect(DrekContext.of(element, { scheduler })).toEqual({
        nsAlias: fallbackCtx.nsAlias,
        scheduler,
      });
    });
    it('specifies schedule window', () => {

      const scheduler = jest.fn(newManualRenderScheduler());

      setRenderScheduler(scheduler);

      const span = document.createElement('span');

      DrekContext.of(span).scheduler({ node: span });

      expect(scheduler).toHaveBeenCalledWith({ window, node: span });
    });
  });
});
