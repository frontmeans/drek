import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekFragment } from './fragment';
import { DrekPlacement } from './placement';

/**
 * Document rendering context.
 *
 * Can be obtained by {@link drekContextOf} function, or {@link DrekFragment#innerContext provided} by rendered
 * fragment.
 *
 * There are three kinds of rendering contexts:
 *
 * 1. Document rendering context.
 *
 *    Such context is always available in document and returned by {@link drekContextOf} function for any DOM node
 *    connected to the document.
 *
 * 2. Fragment content rendering context.
 *
 *    It is created for each rendered fragment and is available via {@link DrekFragment#innerContext} property.
 *    The {@link drekContextOf} function returns this context for fragment's {@link DrekFragment#content content},
 *    as well as for each DOM node added to it.
 *
 * 3. Unrooted rendering context.
 *
 *    When a DOM node is neither connected to a document, nor part of a rendered fragment's
 *    {@link DrekFragment#content content}, the {@link drekContextOf} function creates an unrooted context for the
 *    [root node] of that node.
 *
 *    Unrooted context tracks a {@link DrekPlacement#whenConnected document connection} and
 *    {@link DrekContext#whenSettled settlement} semi-automatically. A {@link DrekContext#lift} method can be used
 *    to forcibly update them.
 *
 *    Semi-automatic tracking means that each time an unrooted context {@link drekContextOf created}, it is registered
 *    for automatic lifting. The lifting happens either asynchronously, or synchronously right before the
 *    {@link drekBuild} function exit.
 *
 *    Alternatively, a {@link drekLift} function can be used to lift a context of the [root node] after adding it to
 *    another one.
 *
 * [root node]: https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
 *
 * @typeParam TStatus - A type of the tuple containing a context content status as its first element.
 */
export abstract class DrekContext<
  TStatus extends [DrekContentStatus] = [DrekContentStatus],
> extends DrekPlacement<TStatus> {

  /**
   * A rendered {@link DrekFragment fragment} this context is provided by, if any.
   */
  abstract readonly fragment: DrekFragment | undefined;

  /**
   * The window this context belongs to.
   */
  abstract readonly window: Window;

  /**
   * The document this context belongs to.
   */
  abstract readonly document: Document;

  /**
   * Namespace aliaser to use.
   */
  abstract readonly nsAlias: NamespaceAliaser;

  /**
   * Render scheduler to use.
   */
  abstract readonly scheduler: RenderScheduler;

  /**
   * An `OnEvent` sender of a settlement event.
   *
   * Such event can be sent by {@link DrekFragment.settle rendered fragment}.
   *
   * The same as {@link whenConnected} by default.
   *
   * Cuts off the event supply after sending the first event.
   */
  get whenSettled(): OnEvent<TStatus> {
    return this.whenConnected;
  }

  /**
   * Tries to lift this rendering context to enclosing one.
   *
   * Tries to find a new root node. If the new root differs from current one, then {@link drekContextOf finds} a context
   * of that new root and connects the status of this context to the found one. After successful lifting the context
   * becomes a proxy accessor of the context it is lifted to, so the latter can be used instead.
   *
   * This has effect for unrooted contexts only.
   *
   * @returns Either a rendering context of the new root node, or this one.
   */
  abstract lift(): DrekContext;

}

export namespace DrekContext {
  /**
   * Updatable document rendering context.
   */
  export interface Updatable extends DrekContext {
    /**
     * Updates this context.
     *
     * @param update - An update to apply to this context.
     *
     * @returns `this` instance.
     */
    update(update?: Update): this;
  }

  /**
   * An update to rendering context.
   */
  export interface Update {
    /**
     * Namespace aliaser to use.
     *
     * The aliaser is not updated when omitted.
     */
    readonly nsAlias?: NamespaceAliaser | undefined;

    /**
     * Render scheduler to use.
     *
     * The scheduler is not updated when omitted.
     */
    readonly scheduler?: RenderScheduler | undefined;
  }
}
