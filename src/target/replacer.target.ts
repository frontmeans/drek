import { removeNodeContent } from '@frontmeans/dom-primitives';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that replaces content of the `host` node.
 *
 * @param host - A node to replace the content of.
 * @param context - Custom rendering context. Defaults to `host` node context.
 *
 * @returns Rendering target.
 */
export function drekReplacer(host: Node, context: DrekContext = drekContextOf(host)): DrekTarget {
  return {
    context,
    host,
    placeContent(content: Node) {
      removeNodeContent(host);
      host.appendChild(content);
      return context;
    },
  };
}
