import { immediateRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { DrekContext } from './context';
import { drekContextOf } from './context-of';
import { DrekFragment } from './fragment';
import { drekAppender } from './target';

describe('drekContextOf', () => {

  let doc: Document;
  let docContext: DrekContext;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    docContext = drekContextOf(doc);
  });

  describe('of document', () => {
    it('refers the document', () => {
      expect(docContext).toBeInstanceOf(DrekContext);
      expect(docContext.window).toBe(window);
      expect(docContext.document).toBe(doc);
    });
    it('is cached', () => {
      expect(drekContextOf(doc)).toBe(docContext);
    });

    describe('lift', () => {
      it('returns itself', () => {
        expect(docContext.lift()).toBe(docContext);
      });
    });
  });

  describe('of connected element', () => {

    let element: Element;

    beforeEach(() => {
      element = doc.body.appendChild(doc.createElement('span'));
    });

    it('is the document context', () => {
      expect(drekContextOf(element)).toBe(drekContextOf(doc));
    });
  });

  describe('of disconnected element', () => {

    let root: Element;
    let element: Element;
    let context: DrekContext;

    beforeEach(() => {
      root = doc.createElement('root-element');
      element = root.appendChild(doc.createElement('test-element'));
      context = drekContextOf(element);
    });

    it('attached to the root node', () => {
      expect(context).not.toBe(docContext);
      expect(context).toBe(drekContextOf(root));
    });
    it('is disconnected', async () => {
      expect(await context.readStatus).toEqual({ connected: false });
    });
    it('inherits document context properties', () => {
      expect(context.window).toBe(docContext.window);
      expect(context.document).toBe(docContext.document);
      expect(context.nsAlias).toBe(docContext.nsAlias);
    });

    describe('scheduler', () => {

      let mockScheduler: RenderScheduler;

      beforeEach(() => {
        mockScheduler = jest.fn(immediateRenderScheduler);
        drekContextOf(doc).update({ scheduler: mockScheduler });
      });

      it('is inherited from document context', () => {
        context.scheduler();
        expect(mockScheduler).toHaveBeenCalledTimes(1);
      });
      it('is updated when lifted', () => {

        const fragmentScheduler = jest.fn(immediateRenderScheduler);
        const fragment = new DrekFragment(drekAppender(document.body), { scheduler: fragmentScheduler });

        fragment.content.appendChild(root);

        context.lift();
        context.scheduler();
        expect(fragmentScheduler).toHaveBeenCalledTimes(1);
      });
      it('renders in new scheduler when lifted', () => {

        const schedule = context.scheduler();

        schedule(noop);

        const fragmentSchedule = jest.fn(immediateRenderScheduler());
        const fragmentScheduler = jest.fn(() => fragmentSchedule);
        const fragment = new DrekFragment(drekAppender(document.body), { scheduler: fragmentScheduler });

        fragment.content.appendChild(root);

        context.lift();
        schedule(noop);
        expect(fragmentScheduler).toHaveBeenCalledTimes(1);
        expect(fragmentSchedule).toHaveBeenCalledTimes(1);
      });
    });

    describe('lift', () => {
      it('does not lift if the root did not change', () => {
        expect(context.lift()).toBe(context);
      });
      it('lifts to enclosing context', () => {

        const fragment = new DrekFragment(drekAppender(document.body));

        fragment.content.appendChild(root);

        expect(context.lift()).toBe(fragment.innerContext);
        expect(context.lift()).toBe(fragment.innerContext);
      });
    });

    describe('whenSettled', () => {
      it('reports settlement when lifted', () => {

        const fragment = new DrekFragment(drekAppender(document.body));

        fragment.content.appendChild(root);

        const whenSettled = jest.fn();
        const settlementSupply = context.whenSettled(whenSettled);

        context.lift();
        expect(whenSettled).not.toHaveBeenCalled();

        fragment.settle();
        expect(whenSettled).toHaveBeenCalledWith({ connected: false, withinFragment: 'added' });
        expect(settlementSupply.isOff).toBe(true);
      });
    });
  });

});
