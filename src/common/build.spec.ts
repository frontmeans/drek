import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { drekBuild } from './build';

describe('drekBuild', () => {
  let doc: Document;
  let docContext: DrekContext;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('test');
    docContext = drekContextOf(doc);
  });

  it('lifts created unrooted contexts', () => {
    const { element, context } = drekBuild(() => {
      const element = doc.createElement('test-element');
      const context = drekContextOf(element);

      doc.body.appendChild(element);

      return { element, context };
    });

    const whenConnected = jest.fn();

    context.whenConnected(whenConnected);
    expect(whenConnected).toHaveBeenCalledWith({ connected: true });
    expect(drekContextOf(element)).not.toBe(context);
    expect(drekContextOf(element)).toBe(docContext);
  });
  it('lifts unrooted contexts not lifted by nested build', () => {
    const { element, context } = drekBuild(() => {
      const element = doc.createElement('root-element');

      const context = drekBuild(() => {
        const nested = element.appendChild(doc.createElement('nested-element'));

        return drekContextOf(nested);
      });

      expect(context).toBe(context);

      const whenConnected = jest.fn();

      context.whenConnected(whenConnected);
      expect(whenConnected).not.toHaveBeenCalled();

      doc.body.appendChild(element);

      return { element, context };
    });

    const whenConnected = jest.fn();

    context.whenConnected(whenConnected);
    expect(whenConnected).toHaveBeenCalledWith({ connected: true });
    expect(drekContextOf(element)).not.toBe(context);
    expect(drekContextOf(element)).toBe(docContext);
  });
  it('prevents auto-lifting of failed to unrooted contexts failed to lift', async () => {
    const { element, context } = drekBuild(() => {
      const element = doc.createElement('test-element');
      const context = drekContextOf(element);

      return { element, context };
    });

    doc.body.appendChild(element);
    await Promise.resolve();

    const whenConnected = jest.fn();

    context.whenConnected(whenConnected);
    expect(whenConnected).not.toHaveBeenCalled();

    expect(context.lift()).toBe(docContext);
    expect(whenConnected).toHaveBeenCalledWith({ connected: true });
    expect(drekContextOf(element)).not.toBe(context);
    expect(drekContextOf(element)).toBe(docContext);
  });
});
