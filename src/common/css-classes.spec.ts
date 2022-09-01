import {
  immediateRenderScheduler,
  ManualRenderScheduler,
  newManualRenderScheduler,
} from '@frontmeans/render-scheduler';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { neverSupply } from '@proc7ts/supply';
import { DrekFragment } from '../fragment';
import { drekAppender } from '../target';
import { DrekCssClasses, drekCssClassesOf } from './css-classes';
import { deriveDrekContext } from './derive-context';

describe('drekCssClassesOf', () => {
  let fragment: DrekFragment;
  let scheduler: ManualRenderScheduler;

  beforeEach(() => {
    scheduler = newManualRenderScheduler();
    fragment = new DrekFragment(drekAppender(document.body), { scheduler });
  });

  let element: Element;
  let css: DrekCssClasses;

  beforeEach(() => {
    element = document.createElement('span');
    fragment.content.appendChild(element);
    scheduler.render();

    css = drekCssClassesOf(element);
  });

  describe('add', () => {
    it('adds CSS class', () => {
      css.add('test');
      expect(element.classList).not.toContain('test');

      scheduler.render();
      expect(element.classList).toContain('test');
    });
    it('removes CSS class when the last supply cut off', () => {
      const supply1 = css.add('test');
      const supply2 = css.add('test');

      scheduler.render();

      supply1.off();
      scheduler.render();
      expect(element.classList).toContain('test');

      supply2.off();
      scheduler.render();
      expect(element.classList).not.toContain('test');
    });
    it('does not remove initially present CSS class', () => {
      element.classList.add('test');

      const supply1 = css.add('test');
      const supply2 = css.add('test');

      scheduler.render();

      supply1.off();
      scheduler.render();
      expect(element.classList).toContain('test');

      supply2.off();
      scheduler.render();
      expect(element.classList).toContain('test');
    });
    it('does not add CSS class when supply cut off initially', () => {
      css.add('test', neverSupply());
      scheduler.render();
      expect(element.classList).not.toContain('test');
    });
    it('does not add CSS class after supply cut off', () => {
      css.add('test').off();
      scheduler.render();
      expect(element.classList).not.toContain('test');
    });
  });

  describe('has', () => {
    it('returns `true` immediately after the class is added', () => {
      css.add('test');
      expect(css.has('test')).toBe(true);

      scheduler.render();
      expect(css.has('test')).toBe(true);
    });
    it('returns `true` iof the class is present initially', () => {
      element.classList.add('test');
      expect(css.has('test')).toBe(true);

      const supply = css.add('test');

      scheduler.render();
      expect(css.has('test')).toBe(true);

      supply.off();
      scheduler.render();
      expect(css.has('test')).toBe(true);
    });
    it('returns `false` when the class removed', () => {
      const supply = css.add('test');

      scheduler.render();
      supply.off();
      scheduler.render();

      expect(css.has('test')).toBe(false);
    });
    it('returns `false` if the class is not added', () => {
      css.add('test').off();

      expect(css.has('test')).toBe(false);

      scheduler.render();
      expect(css.has('test')).toBe(false);
    });
  });

  describe('renderIn', () => {
    it('renders in custom context', () => {
      const updatedCss = css.renderIn(
        deriveDrekContext(fragment.innerContext, { scheduler: immediateRenderScheduler }),
      );
      const supply = updatedCss.add('test');

      expect(css.has('test')).toBe(true);
      expect(updatedCss.has('test')).toBe(true);
      expect(element.classList).toContain('test');

      supply.off();
      expect(css.has('test')).toBe(false);
      expect(updatedCss.has('test')).toBe(false);
      expect(element.classList).not.toContain('test');
    });
    it('returns original instance if context did not change', () => {
      const updatedCss = css.renderIn(
        deriveDrekContext(fragment.innerContext, { scheduler: immediateRenderScheduler }),
      );

      expect(updatedCss.renderIn(fragment.innerContext)).toBe(css);
    });
  });
});
