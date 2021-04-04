import { documentOf } from './document-of';

/**
 * Returns an owner window of the given DOM node.
 *
 * @param node - Source node.
 *
 * @returns Either a `defaultView` of the {@link documentOf node document}, or `window` instance if there is no one.
 */
export function windowOf(node: Node): Window {
  return documentOf(node).defaultView || window;
}
