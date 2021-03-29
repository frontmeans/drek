import { removeNodeContent } from './remove-node-content';

describe('removeNodeContent', () => {
  it('removes all child nodes', () => {

    const node = document.createElement('div');

    node.append(document.createComment('comment'), 'text', document.createElement('span'), 'suffix');
    removeNodeContent(node);

    expect(node.childNodes).toHaveLength(0);
    expect(node.textContent).toBe('');
  });
  it('removes comment text', () => {

    const node = document.createComment('comment');

    removeNodeContent(node);
    expect(node.childNodes).toHaveLength(0);
    expect(node.textContent).toBe('');
  });
  it('removes text', () => {

    const node = document.createTextNode('text');

    removeNodeContent(node);
    expect(node.childNodes).toHaveLength(0);
    expect(node.textContent).toBe('');
  });
});
