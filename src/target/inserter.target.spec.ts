import { describe, expect, it } from '@jest/globals';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekInserter } from './inserter.target';

describe('drekInserter', () => {
  it('inserts content to host node before the given node', () => {

    const host = document.createElement('div');
    const child1 = host.appendChild(document.createComment('start'))
    const child2 = host.appendChild(document.createComment('end'))
    const target = drekInserter(host, child2);
    const node = document.createElement('test');

    expect(target.host).toBe(host);
    expect(target.context).toBe(drekContextOf(host));
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(host.childNodes)).toEqual([child1, node, child2]);
  });
  it('appends content to host node when `before` is `null`', () => {

    const host = document.createElement('div');
    const child1 = host.appendChild(document.createComment('start'))
    const child2 = host.appendChild(document.createComment('end'))
    const target = drekInserter(host, null);
    const node = document.createElement('test');

    expect(target.context).toBe(drekContextOf(host));
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(host.childNodes)).toEqual([child1, child2, node]);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const host = document.createElement('div');
    const target = drekInserter(host, null, context);
    const node = document.createElement('test');

    expect(target.context).toBe(context);
    expect(target.placeContent(node)).toBe(target.context);
    expect(Array.from(host.childNodes)).toEqual([node]);
  });
});
