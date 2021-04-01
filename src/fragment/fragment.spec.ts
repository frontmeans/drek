import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newManualRenderScheduler, queuedRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { deriveDrekContext } from '../derive-context';
import { drekAppender, drekReplacer, DrekTarget } from '../target';
import { DrekFragment } from './fragment';

describe('DrekFragment', () => {

  let doc: Document;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
  });

  let target: DrekTarget;
  let targetScheduler: RenderScheduler;
  let targetContext: DrekContext;
  let fragment: DrekFragment;

  beforeEach(() => {
    targetScheduler = jest.fn(queuedRenderScheduler);
    targetContext = deriveDrekContext(
        drekContextOf(doc),
        {
          scheduler: targetScheduler,
        },
    );
    target = drekReplacer(doc.body, targetContext);
    fragment = new DrekFragment(target);
  });

  it('used as rendering context for its content', async () => {

    const content = await new Promise<DocumentFragment>(resolve => {
      fragment.scheduler()(({ content }) => resolve(content));
    });

    expect(drekContextOf(content)).toBe(fragment);
  });

  it('used as rendering context for nested elements', async () => {

    const context = await new Promise<DrekContext>(resolve => {
      fragment.scheduler()(({ fragment: { document }, content }) => {

        const span = content.appendChild(document.createElement('span'));

        resolve(drekContextOf(span));
      });
    });

    expect(context).toBe(fragment);
  });

  describe('content', () => {
    it('can be specified explicitly', async () => {

      const customContent = doc.createDocumentFragment();

      fragment = new DrekFragment(target, { content: customContent });

      const content = await new Promise<DocumentFragment>(resolve => {
        fragment.scheduler()(({ content }) => {
          resolve(content);
        });
      });

      expect(content).toBe(customContent);
      expect(drekContextOf(customContent)).toBe(fragment);
    });
    it('can not be reused by another fragment', async () => {

      const content = await new Promise<DocumentFragment>(resolve => {
        fragment.scheduler()(({ content }) => {
          resolve(content);
        });
      });

      expect(() => new DrekFragment(target, { content })).toThrow('Can not render content of another fragment');
    });
  });

  describe('target', () => {
    it('is the one passed to constructor', () => {
      expect(fragment.target).toBe(target);
    });
  });

  describe('window', () => {
    it('is derived from target', () => {
      expect(fragment.window).toBe(window);
    });
  });

  describe('document', () => {
    it('is derived from target', () => {
      expect(fragment.document).toBe(doc);
    });
  });

  describe('nsAlias', () => {
    it('is derived from target by default', () => {
      expect(fragment.nsAlias).toBe(target.context.nsAlias);
    });
    it('can be specified explicitly', () => {

      const nsAlias = newNamespaceAliaser();

      fragment = new DrekFragment(target, { nsAlias });

      expect(fragment.nsAlias).toBe(nsAlias);
      expect(fragment.nsAlias).not.toBe(target.context.nsAlias);
    });
  });

  describe('scheduler', () => {
    it('can be specified explicitly', async () => {

      const scheduler = newManualRenderScheduler();

      fragment = new DrekFragment(target, { scheduler });

      const contentPromise = new Promise<DocumentFragment>(resolve => {
        fragment.scheduler()(exec => {
          exec.postpone(({ content }) => {
            resolve(content);
          });
        });
      });

      scheduler.render();

      const content = await contentPromise;

      expect(content.hasChildNodes()).toBe(false);

      fragment.scheduler()(({ fragment: { document }, content }) => {
        content.appendChild(document.createElement('test-element'));
      });

      expect(content.hasChildNodes()).toBe(false);

      scheduler.render();
      expect(content.children[0]?.tagName.toLowerCase()).toBe('test-element');
    });
    it('reset to target context scheduler when rendered', () => {
      fragment.scheduler()(noop);
      expect(targetScheduler).not.toHaveBeenCalled();

      fragment.render();
      expect(targetScheduler).toHaveBeenCalledTimes(1);

      fragment.scheduler()(noop);
      expect(targetScheduler).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRendered', () => {
    it('is `false` by default', () => {
      expect(fragment.isRendered).toBe(false);
    });
    it('set to `true` when fragment rendered', () => {
      expect(fragment.render().isRendered).toBe(true);
    });
  });

  describe('readStatus', () => {
    it('sends `connected` status once rendered to document', () => {

      let status!: DrekContentStatus;

      fragment.readStatus(s => status = s);
      expect(status).toEqual({ connected: false });

      fragment.render();
      expect(status).toEqual({ connected: true });
    });
    it('sends `connected` status once render target fragment is rendered', async () => {

      const fragment2 = await new Promise<DrekFragment>(resolve => {
        fragment.scheduler()(({ content }) => resolve(new DrekFragment(drekAppender(content))));
      });

      let status!: DrekContentStatus;

      fragment.readStatus(s => status = s);

      fragment2.render();
      expect(status).toEqual({ connected: false });

      fragment.render();
      expect(status).toEqual({ connected: true });
    });
  });

  describe('whenSettled', () => {
    it('sends a status one time when `settle()` called', () => {

      let settled1: DrekContentStatus | undefined;
      const supply1 = fragment.whenSettled(s => settled1 = s);

      expect(settled1).toBeUndefined();

      fragment.settle();
      expect(settled1).toEqual({ connected: false });
      expect(supply1.isOff).toBe(true);

      let settled2: DrekContentStatus | undefined;
      const supply2 = fragment.whenSettled(s => settled2 = s);
      expect(settled2).toBeUndefined();

      fragment.settle();
      expect(settled2).toEqual({ connected: false });
      expect(supply2.isOff).toBe(true);
    });
    it('sends a status one time when rendered', () => {

      let settled: DrekContentStatus | undefined;
      const supply = fragment.whenSettled(s => settled = s);

      fragment.render();
      expect(settled).toEqual({ connected: true });
      expect(supply.isOff).toBe(true);
    });
    it('is the same as `whenConnected` once rendered', () => {
      fragment.render();

      expect(fragment.whenSettled).toBe(fragment.whenConnected);
    });
  });

  describe('render', () => {
    it('prevents rendering for the second time', () => {
      fragment.render();
      expect(() => fragment.render()).toThrow('Fragment already rendered');
    });
  });
});
