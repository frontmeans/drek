/**
 * Removes all child nodes from the given one.
 *
 * @param node - DOM node to remove the content of.
 */
export function removeNodeContent(node: Node): void {
  node.textContent = null;
}
