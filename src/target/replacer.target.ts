import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { removeNodeContent } from '../misc';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that replaces content of the given node.
 *
 * @param parent - A node to replace content of.
 * @param context - Custom rendering context. Defaults to `parent` node context.
 *
 * @returns Rendering target.
 */
export function drekReplacer(parent: Node, context: DrekContext = drekContextOf(parent)): DrekTarget {
  return {
    context,
    placeContent(content: Node) {
      removeNodeContent(parent);
      parent.appendChild(content);
      return context;
    },
  };
}
