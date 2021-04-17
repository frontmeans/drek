import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekReplacer } from './replacer.target';

describe('drekReplacer', () => {
  it('appends node to parent target', () => {

    const host = document.createElement('div');
    const initial = host.appendChild(document.createElement('span'));
    const target = drekReplacer(host);
    const node = document.createElement('test');

    expect(target.host).toBe(host);
    expect(target.context).toBe(drekContextOf(host));
    expect(target.placeContent(node)).toBe(target.context);
    expect(host.children).toContain(node);
    expect(host.children).not.toContain(initial);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const host = document.createElement('div');
    const target = drekReplacer(host, context);
    const node = document.createElement('test');

    expect(target.context).toBe(context);
    expect(target.placeContent(node)).toBe(target.context);
    expect(host.children).toContain(node);
  });
});
