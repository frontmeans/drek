import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that inserts content to parent node at particular position.
 *
 * @param host - A node to insert content to.
 * @param before - A child node of `host` one to insert the content before, or `null` to append it as the last child
 * of `host` node.
 * @param context - Custom rendering context. Defaults to `host` node context.
 *
 * @returns Rendering target.
 */
export function drekInserter(
  host: Node,
  before: Node | null,
  context: DrekContext = drekContextOf(host),
): DrekTarget {
  return {
    context,
    host,
    placeContent(content: Node) {
      host.insertBefore(content, before);

      return context;
    },
  };
}
