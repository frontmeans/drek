import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';

/**
 * Tries to {@link DrekContext.lift lift} the rendering context of the given DOM `node` to enclosing one.
 *
 * It may be useful to call this method e.g. on a custom element after appending it to {@link DrekFragment fragment}.
 * The former may access its rendering context in constructor. Calling this method would lift that context to fragment's
 * one, so the custom element would be notified on its {@link DrekContext.whenSettled settlement}.
 *
 * Does nothing if the given node has no rendering context attached to it.
 *
 * @param node - A DOM node with rendering context to lift.
 *
 * @returns The `node` itself.
 */
export function drekLift<TNode extends Node>(node: TNode): TNode;

export function drekLift<TNode extends Node>(node: DrekContext$Holder<TNode>): TNode {
  node[DrekContext__symbol]?.lift();

  return node;
}
