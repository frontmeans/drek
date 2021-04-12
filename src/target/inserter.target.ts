import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that inserts content to parent node at particular position.
 *
 * @param parent - A node to insert content to.
 * @param before - A child node of `parent` to insert the content before, or `null` to append it as the last child
 * of `parent` node.
 * @param context - Custom rendering context. Defaults to `parent` node context.
 *
 * @returns Rendering target.
 */
export function drekInserter(
    parent: Node,
    before: Node | null,
    context: DrekContext = drekContextOf(parent),
): DrekTarget {
  return {
    context,
    placeContent(content: Node) {
      parent.insertBefore(content, before);
      return context;
    }
  };
}
