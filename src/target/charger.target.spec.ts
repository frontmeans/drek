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

  it('wraps content into predefined element by default', () => {
    target.placeContent(content);

    const wrapper = out.querySelector('drek-content') as HTMLElement;

    expect(wrapper).toBeDefined();
    expect(wrapper.style.display).toBe('contents');
    expect(Array.from(wrapper.childNodes)).toEqual([content]);
  });
  it('wraps content into predefined element only once', () => {
    target = drekCharger(drekAppender(out), null);
    target.placeContent(content);

    const content2 = document.createElement('test-element2');

    target.placeContent(content2);

    const allWrappers = out.querySelectorAll('drek-content');

    expect(allWrappers.length).toBe(1);

    const wrapped = allWrappers[0];

    expect(Array.from(wrapped.childNodes)).toEqual([content2]);
  });
  it('wraps content into element with custom tag name', () => {
    target = drekCharger(drekAppender(out), 'test-content');
    target.placeContent(content);

    const wrapper = out.querySelector('test-content') as HTMLElement;

    expect(wrapper).toBeDefined();
    expect(wrapper.style.display).toBe('contents');
    expect(Array.from(wrapper.childNodes)).toEqual([content]);
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

    const wrapper = out.querySelector('test-content') as HTMLElement;

    expect(wrapper).toBeDefined();
    expect(wrapper.style.display).toBe('contents');
    expect(Array.from(wrapper.childNodes)).toEqual([content]);
  });
});
