import { describe, expect, it } from '@jest/globals';
import { drekContextOf } from '../context-of';
import { DrekFragment } from '../fragment';
import { drekAppender } from '../target';
import { drekLift } from './lift';

describe('drekLift', () => {
  it('lifts node rendering context', () => {
    const element = document.createElement('test-element');
    const context = drekContextOf(element);
    const fragment = new DrekFragment(drekAppender(document.body));

    fragment.content.appendChild(element);

    expect(drekLift(element)).toBe(element);

    expect(drekContextOf(element)).toBe(fragment.innerContext);
    expect(context.lift()).toBe(fragment.innerContext);
  });
  it('does nothing when the node has no rendering context attached', () => {
    const element = document.createElement('test-element');
    const fragment = new DrekFragment(drekAppender(document.body));

    fragment.content.appendChild(element);

    expect(drekLift(element)).toBe(element);
    expect(drekContextOf(element)).toBe(fragment.innerContext);
  });
});
