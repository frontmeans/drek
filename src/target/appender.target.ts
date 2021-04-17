import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that appends content to parent node.
 *
 * @param host - A node to append content to.
 * @param context - Custom rendering context. Defaults to `host` node context.
 *
 * @returns Rendering target.
 */
export function drekAppender(host: Node, context: DrekContext = drekContextOf(host)): DrekTarget {
  return {
    context,
    host,
    placeContent(content: Node) {
      host.appendChild(content);
      return context;
    }
  };
}
