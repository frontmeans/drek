import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekReplacer } from './replacer.target';

describe('drekReplacer', () => {
  it('appends node to parent target', () => {

    const parent = document.createElement('div');
    const initial = parent.appendChild(document.createElement('span'));
    const target = drekReplacer(parent);
    const node = document.createElement('test');

    expect(target.context).toBe(drekContextOf(parent));
    expect(target.placeContent(node)).toBe(target.context);
    expect(parent.children).toContain(node);
    expect(parent.children).not.toContain(initial);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const parent = document.createElement('div');
    const target = drekReplacer(parent, context);
    const node = document.createElement('test');

    expect(target.context).toBe(context);
    expect(target.placeContent(node)).toBe(target.context);
    expect(parent.children).toContain(node);
  });
});
