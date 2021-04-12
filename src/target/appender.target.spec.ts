import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekAppender } from './appender.target';

describe('drekAppender', () => {
  it('appends node to parent target', () => {

    const parent = document.createElement('div');
    const child1 = parent.appendChild(document.createComment('start'))
    const child2 = parent.appendChild(document.createComment('end'))
    const target = drekAppender(parent);
    const node = document.createElement('test');

    expect(target.context).toBe(drekContextOf(parent));
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(parent.childNodes)).toEqual([child1, child2, node]);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const parent = document.createElement('div');
    const target = drekAppender(parent, context);
    const node = document.createElement('test');

    expect(target.context).toBe(context);
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(parent.childNodes)).toEqual([node]);
  });
});
