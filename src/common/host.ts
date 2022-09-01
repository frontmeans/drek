import { isElementNode, nodeHost } from '@frontmeans/dom-primitives';
import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';

/**
 * Finds a host element of the given DOM node with respect to rendering targets.
 *
 * Crosses shadow DOM and {@link DrekFragment rendered fragment} bounds. In the latter case returns a
 * {@link DrekTarget.host rendering target host} instead of the document fragment.
 *
 * @param node - Target DOM element.
 *
 * @returns Either parent element of the given node, or `undefined` when not found.
 */
export function drekHost(node: Node): Element | undefined {
  const host = nodeHost(node);

  if (host) {
    return host;
  }

  const parent: DrekContext$Holder<Node> = node.parentNode || node;
  const renderHost = parent[DrekContext__symbol]?.fragment?.target.host;

  return !renderHost || isElementNode(renderHost) ? renderHost : drekHost(renderHost);
}
