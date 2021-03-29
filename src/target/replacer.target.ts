import { DrekContext } from '../context';
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
export function drekReplacer(parent: Node, context: DrekContext = DrekContext.of(parent)): DrekTarget {
  return {
    context,
    placeContent(content: Node) {
      removeNodeContent(parent);
      parent.appendChild(content);
      return context;
    },
  };
}
