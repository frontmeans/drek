import { isElementNode } from './node-types';

/**
 * Finds parent element of the given node.
 *
 * Crosses shadow DOM bounds.
 *
 * @param node - Target element.
 *
 * @returns Either parent element of the given one, or `null` when not found.
 */
export function parentElementOf(node: Node): Element | null {

  const { parentNode } = node;

  return parentNode && isElementNode(parentNode) && parentNode
      || (node.getRootNode() as Partial<ShadowRoot>).host// Inside shadow DOM?
      || null;
}
