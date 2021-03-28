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
  });
});
