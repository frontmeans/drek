import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekInserter } from './inserter.target';

describe('drekInserter', () => {
  it('inserts node to parent target before the given node', () => {

    const parent = document.createElement('div');
    const child1 = parent.appendChild(document.createComment('start'))
    const child2 = parent.appendChild(document.createComment('end'))
    const target = drekInserter(parent, child2);
    const node = document.createElement('test');

    expect(target.context).toBe(drekContextOf(parent));
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(parent.childNodes)).toEqual([child1, node, child2]);
  });
  it('appends node to parent target when `before` is `null`', () => {

    const parent = document.createElement('div');
    const child1 = parent.appendChild(document.createComment('start'))
    const child2 = parent.appendChild(document.createComment('end'))
    const target = drekInserter(parent, null);
    const node = document.createElement('test');

    expect(target.context).toBe(drekContextOf(parent));
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(parent.childNodes)).toEqual([child1, child2, node]);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const parent = document.createElement('div');
    const target = drekInserter(parent, null, context);
    const node = document.createElement('test');

    expect(target.context).toBe(context);
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(parent.childNodes)).toEqual([node]);
  });
});
