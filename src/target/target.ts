import { DrekContext } from '../context';
import { DrekContentStatus } from './content-status';
import { DrekPlacement } from './placement';

/**
 * Rendering target.
 *
 * Represents a part of the DOM tree to place the rendered contents to.
 *
 * @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
 */
export interface DrekTarget<TStatus extends [DrekContentStatus] = [DrekContentStatus]> {

  /**
   * Rendering context of this rendering target.
   */
  readonly context: DrekContext;

  /**
   * Places rendered content to this target.
   *
   * It is up to the implementation to decide how the content is placed. E.g. some implementations append the content,
   * while the others replace it.
   *
   * It is expected that this operation is performed within a render scheduler the user chooses, probably the one of
   * rendering {@link context}.
   *
   * @param content - Rendered DOM node to place.
   *
   * @returns Rendered content placement status.
   */
  placeContent(content: Node): DrekPlacement<TStatus>

}
