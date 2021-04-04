/**
 * Returns a document of the given DOM node.
 *
 * @param node - Source node.
 *
 * @returns Either an `ownerDocument`, or a node itself if it is a document.
 */
export function documentOf(node: Node): Document {
  return node.ownerDocument || (node as Document);
}
