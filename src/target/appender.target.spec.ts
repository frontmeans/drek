import { DrekContext } from '../context';
import { drekAppender } from './appender.target';

describe('drekAppender', () => {
  it('appends node to parent target', () => {

    const parent = document.createElement('div');
    const appender = drekAppender(parent);
    const node = document.createElement('test');

    expect(appender.context).toBe(DrekContext.of(parent));
    expect(appender.placeContent(node)).toBe(appender.context);
    expect(parent.children).toContain(node);
  });
  it('uses explicit context', () => {

    const context: DrekContext = {} as any;
    const parent = document.createElement('div');
    const appender = drekAppender(parent, context);
    const node = document.createElement('test');

    expect(appender.context).toBe(context);
    expect(appender.placeContent(node)).toBe(appender.context);
    expect(parent.children).toContain(node);
  });
});
