import { DrekContext } from './context';
import { DrekContext$ofRootNode } from './context.of-root-node.impl';

/**
 * Obtains an updatable rendering context of the given document.
 *
 * @param document - Target document.
 *
 * @returns Updatable document rendering context.
 */
export function drekContextOf(document: Document): DrekContext.Updatable;

/**
 * Obtains a rendering context of the given node.
 *
 * If the node is connected to document, then the rendering context of that document is returned. Otherwise, if the node
 * belongs to the {@link DrekFragment.content content} of the rendered fragment, then the context
 * {@link DrekFragment.innerContext provided} by that fragment is returned. Otherwise, an unrooted context is created
 * and attached to the [root node] of the target `node`.
 *
 * [root node]: https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
 *
 * @param node - Target node.
 *
 * @returns Target node rendering context.
 */
export function drekContextOf(node: Node): DrekContext;

export function drekContextOf(node: Node): DrekContext {
  for (;;) {
    const root = node.getRootNode({ composed: true });

    if (root === node) {
      return DrekContext$ofRootNode(node);
    }

    node = root;
  }
}
