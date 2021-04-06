import { NamespaceAliaser, NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, queuedRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { deriveDrekContext } from '../common';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekAppender, drekReplacer, DrekTarget } from '../target';
import { DrekFragment } from './fragment';

describe('DrekFragment', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  let target: DrekTarget;
  let targetNsAlias: NamespaceAliaser;
  let targetScheduler: RenderScheduler;
  let targetContext: DrekContext;
  let fragment: DrekFragment;

  beforeEach(() => {
    targetNsAlias = jest.fn(newNamespaceAliaser());
    targetScheduler = jest.fn(queuedRenderScheduler);
    targetContext = deriveDrekContext(
        drekContextOf(doc),
        {
          nsAlias: targetNsAlias,
          scheduler: targetScheduler,
        },
    );
    target = drekReplacer(doc.body, targetContext);
    fragment = new DrekFragment(target);
  });

  describe('content', () => {
    it('can be specified explicitly', () => {

      const customContent = doc.createDocumentFragment();

      fragment = new DrekFragment(target, { content: customContent });

      expect(fragment.content).toBe(customContent);
      expect(drekContextOf(customContent)).toBe(fragment.innerContext);
    });
    it('can not be reused by another fragment', () => {
      expect(() => new DrekFragment(target, { content: fragment.content }))
          .toThrow('Can not render content of another fragment');
    });
  });

  describe('target', () => {
    it('is the one passed to constructor', () => {
      expect(fragment.target).toBe(target);
    });
  });

  describe('innerContext', () => {
    it('is used as rendering context for its content', () => {
      expect(drekContextOf(fragment.content)).toBe(fragment.innerContext);
    });

    it('is used as rendering context for nested elements', () => {

      const span = fragment.content.appendChild(document.createElement('span'));

      expect(drekContextOf(span)).toBe(fragment.innerContext);
    });

    describe('window', () => {
      it('is derived from target', () => {
        expect(fragment.innerContext.window).toBe(window);
      });
    });

    describe('document', () => {
      it('is derived from target', () => {
        expect(fragment.innerContext.document).toBe(doc);
      });
    });

    describe('nsAlias', () => {
      it('is derived from target by default', () => {

        const ns = new NamespaceDef('uri:test:ns');

        fragment.innerContext.nsAlias(ns);
        expect(targetNsAlias).toHaveBeenCalledWith(ns);
      });
      it('can be specified explicitly', () => {

        const nsAlias = jest.fn(newNamespaceAliaser());

        fragment = new DrekFragment(target, { nsAlias });

        const ns = new NamespaceDef('uri:test:ns');

        fragment.innerContext.nsAlias(ns);
        expect(nsAlias).toHaveBeenCalledWith(ns);
        expect(targetNsAlias).not.toHaveBeenCalled();
      });
    });

    describe('scheduler', () => {
      it('can be specified explicitly', async () => {

        const scheduler = newManualRenderScheduler();

        fragment = new DrekFragment(target, { scheduler });

        const contentPromise = new Promise<DocumentFragment>(resolve => {
          fragment.innerContext.scheduler()(exec => {
            exec.postpone(({ content }) => {
              resolve(content);
            });
          });
        });

        scheduler.render();

        const content = await contentPromise;

        expect(content.hasChildNodes()).toBe(false);

        fragment.innerContext.scheduler()(({ content }) => {
          content.appendChild(content.ownerDocument.createElement('test-element'));
        });

        expect(content.hasChildNodes()).toBe(false);

        scheduler.render();
        expect(content.children[0]?.tagName.toLowerCase()).toBe('test-element');
      });
      it('reset to target context scheduler when rendered', () => {
        fragment.innerContext.scheduler()(noop);
        expect(targetScheduler).not.toHaveBeenCalled();

        fragment.render();
        expect(targetScheduler).toHaveBeenCalledTimes(1);

        fragment.innerContext.scheduler()(noop);
        expect(targetScheduler).toHaveBeenCalledTimes(2);
      });
    });

    describe('readStatus', () => {
      it('sends `connected` status once rendered to document', () => {

        let status!: DrekContentStatus;

        fragment.innerContext.readStatus(s => status = s);
        expect(status).toEqual({ connected: false });

        fragment.render();
        expect(status).toEqual({ connected: true });
      });
      it('sends `connected` status once render target fragment is rendered', async () => {

        const fragment2 = await new Promise<DrekFragment>(resolve => {
          fragment.innerContext.scheduler()(
              ({ content }) => resolve(new DrekFragment(drekAppender(content))),
          );
        });

        let status!: DrekContentStatus;

        fragment.innerContext.readStatus(s => status = s);

        fragment2.render();
        expect(status).toEqual({ connected: false });

        fragment.render();
        expect(status).toEqual({ connected: true });
      });
    });

    describe('whenSettled', () => {
      it('sends a status one time when `settle()` called', () => {

        let settled1: DrekContentStatus | undefined;
        const supply1 = fragment.innerContext.whenSettled(s => settled1 = s);

        expect(settled1).toBeUndefined();

        fragment.settle();
        expect(settled1).toEqual({ connected: false });
        expect(supply1.isOff).toBe(true);

        let settled2: DrekContentStatus | undefined;
        const supply2 = fragment.innerContext.whenSettled(s => settled2 = s);
        expect(settled2).toBeUndefined();

        fragment.settle();
        expect(settled2).toEqual({ connected: false });
        expect(supply2.isOff).toBe(true);
      });
      it('sends a status one time when rendered', () => {

        let settled: DrekContentStatus | undefined;
        const supply = fragment.innerContext.whenSettled(s => settled = s);

        fragment.render();
        expect(settled).toEqual({ connected: true });
        expect(supply.isOff).toBe(true);
      });
      it('is the same as `whenConnected` once rendered', () => {

        const context = fragment.innerContext;

        fragment.render();

        expect(context.whenSettled).toBe(context.whenConnected);
      });
    });
  });

  describe('render', () => {
    it('updates inner context', () => {

      const prevContext = fragment.innerContext;

      fragment.render();

      expect(fragment.innerContext).not.toBe(prevContext);
    });
  });
});
