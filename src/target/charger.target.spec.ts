import { isCommentNode } from '@frontmeans/dom-primitives';
import { drekAppender } from './appender.target';
import { drekCharger } from './charger.target';
import { drekReplacer } from './replacer.target';
import { DrekTarget } from './target';

describe('drekCharger', () => {

  let out: Element;
  let target: DrekTarget;
  let content: Node;

  beforeEach(() => {
    out = document.createElement('div');
    target = drekCharger(drekAppender(out));
    content = document.createTextNode('rendered content');
  });

  it('encloses content into random comments', () => {
    target.placeContent(content);

    const [start, placed, end] = Array.from(out.childNodes)

    expect(isCommentNode(start)).toBe(true);
    expect(isCommentNode(end)).toBe(true);
    expect(placed).toBe(content);
  });
  it('encloses content into comments only once', () => {
    target = drekCharger(drekAppender(out), null);
    target.placeContent(content);

    const [start, , end] = Array.from(out.childNodes);

    const content2 = document.createElement('test-element2');

    target.placeContent(content2);

    expect(Array.from(out.childNodes)).toEqual([start, content2, end]);
  });
  it('encloses content with custom comments', () => {
    target = drekCharger(drekAppender(out), 'test-content');
    target.placeContent(content);

    const [start, placed, end] = Array.from(out.childNodes)

    expect(start.textContent).toBe(' [[ test-content [[ ');
    expect(end.textContent).toBe(' ]] test-content ]] ');
    expect(placed).toBe(content);
  });
  it('uses custom charger', () => {
    target = drekCharger(
        drekReplacer(out),
        {
          charge(content, target) {

            const fragment = document.createDocumentFragment();

            fragment.appendChild(document.createComment('content start'));
            fragment.appendChild(content);
            fragment.appendChild(document.createComment('content end'));

            return target.placeContent(fragment);
          },
        },
    );
    target.placeContent(content);

    const children = Array.from(out.childNodes);

    expect(children[0].textContent).toBe('content start')
    expect(children[1]).toBe(content);
    expect(children[2].textContent).toBe('content end')
  });
  it('uses charger created by factory', () => {
    target = drekCharger(drekAppender(out), () => 'test-content');
    target.placeContent(content);

    const [start, placed, end] = Array.from(out.childNodes)

    expect(start.textContent).toBe(' [[ test-content [[ ');
    expect(end.textContent).toBe(' ]] test-content ]] ');
    expect(placed).toBe(content);
  });
});
