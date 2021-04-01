import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { AfterEvent, OnEvent } from '@proc7ts/fun-events';
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
   * Creates a rendering context based on this one.
   *
   * @param update - Context update.
   *
   * @returns Updated rendering context.
   */
  with(update: DrekContext.Update = {}): DrekContext<TStatus> {
    return DrekContext$with(this, update);
  }

}

export namespace DrekContext {

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

function DrekContext$with<TStatus extends [DrekContentStatus] = [DrekContentStatus]>(
    ancestor: DrekContext<TStatus>,
    {
      nsAlias = ancestor.nsAlias,
      scheduler = ancestor.scheduler,
    }: DrekContext.Update,
): DrekContext<TStatus> {

  class DrekContext$Derived extends DrekContext<TStatus> {

    get window(): Window {
      return ancestor.window;
    }

    get document(): Document {
      return ancestor.document;
    }

    get nsAlias(): NamespaceAliaser {
      return nsAlias;
    }

    get scheduler(): RenderScheduler {
      return scheduler;
    }

    get readStatus(): AfterEvent<TStatus> {
      return ancestor.readStatus;
    }

  }

  return new DrekContext$Derived();
}
