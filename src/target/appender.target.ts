import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that appends content to parent node.
 *
 * @param parent - A node to append content to.
 * @param context - Custom rendering context. Defaults to `parent` node context.
 *
 * @returns Rendering target.
 */
export function drekAppender(parent: Node, context: DrekContext = drekContextOf(parent)): DrekTarget {
  return {
    context,
    placeContent(content: Node) {
      parent.appendChild(content);
      return context;
    }
  };
}
