import { DrekContext } from '../context';
import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';

/**
 * Tries to {@link DrekContext.lift lift} the rendering context of the given DOM `node` to enclosing one.
 *
 * It may be useful to call this method e.g. on a custom element after appending it to {@link DrekFragment fragment}.
 * The former may access its rendering context in constructor. Calling this method would lift that context to fragment's
 * one, so the custom element would be notified on {@link DrekContext.whenSettled settlement}.
 *
 * Does nothing if the given node has no rendering context attached to it.
 *
 * @param node - A DOM node with rendering context to lift.
 *
 * @returns Either a rendering context of the new root node, or the one of the `node` itself, if present.
 */
export function drekLift(node: Node): DrekContext | undefined;

export function drekLift(node: DrekContext$Holder<Node>): DrekContext | undefined {
  return node[DrekContext__symbol]?.lift();
}
