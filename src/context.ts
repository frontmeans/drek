import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekPlacement } from './placement';

/**
 * Document rendering context.
 *
 * @typeParam TStatus - A type of the tuple containing a context content status as its first element.
 */
export abstract class DrekContext<TStatus extends [DrekContentStatus] = [DrekContentStatus]>
    extends DrekPlacement<TStatus> {

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
   * This is only meaningful for context attached to disconnected DOM node by {@link drekContextOf} function.
   *
   * Tries to find new root node. If the new root differs from current one, the {@link drekContextOf finds} a context
   * of that new root and connects the status of this context to the found one.
   *
   * This has no effect for document rendering context and for {@link DrekFragment rendered fragments}.
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
    readonly nsAlias?: NamespaceAliaser;

    /**
     * Render scheduler to use.
     *
     * The scheduler is not updated when omitted.
     */
    readonly scheduler?: RenderScheduler;

  }

}
