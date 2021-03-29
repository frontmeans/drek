import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { newRenderSchedule, RenderSchedule, RenderScheduleOptions } from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe, OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';
import { isDocumentFragmentNode } from './misc';
import { DrekPlacement } from './placement';

/**
 * Document rendering context.
 *
 * @typeParam TStatus - A type of the tuple containing a context content status as its first element.
 */
export abstract class DrekContext<TStatus extends [DrekContentStatus] = [DrekContentStatus]>
    extends DrekPlacement<TStatus> {

  /**
   * Obtains and possibly updated a rendering context of the given document.
   *
   * @param document - Target document.
   * @param update - An update to target document context.
   *
   * @returns Target document rendering context updates applied.
   */
  static of(document: Document, update?: DrekContext.Update): DrekContext;

  /**
   * Obtains a rendering context of the given node.
   *
   * The rendering context is provided to the node by the closest {@link DrekFragment rendering fragment}. If the node
   * does not belong to any fragment, then the context is the one of the document.
   *
   * @param node - Target node.
   *
   * @returns Target node rendering context.
   */
  static of(node: Node): DrekContext;

  static of(node: Node, update?: DrekContext.Update): DrekContext {
    for (;;) {

      const root = node.getRootNode({ composed: true });

      if (root === node) {
        if (isDocumentFragmentNode(node)) {

          const { [DrekContext__symbol]: fragmentCtx }: DrekContext$Holder<DocumentFragment> = node;

          if (fragmentCtx) {
            return fragmentCtx;
          }
        }

        return DrekContext$ofDocument(node.ownerDocument || (node as Document), update);
      }

      node = root;
    }
  }

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

const DrekContext$update__symbol = (/*#__PURE__*/ Symbol('DrekContext.update'));

function DrekContext$ofDocument(
    document: DrekContext$Holder<Document>,
    update?: DrekContext.Update,
): DrekContext {

  const existing = document[DrekContext__symbol] as DrekContext$OfDocument | undefined;

  if (existing) {
    if (update) {
      existing[DrekContext$update__symbol](update);
    }
    return existing;
  }

  let {
    nsAlias: nsAliasImpl = newNamespaceAliaser(),
    scheduler: schedulerImpl = newRenderSchedule,
  } = update || {};

  const view = document.defaultView || window;
  const nsAlias: NamespaceAliaser = ns => nsAliasImpl(ns);
  const scheduler = (
      options?: RenderScheduleOptions,
  ): RenderSchedule => schedulerImpl({
    window: view,
    ...options,
  });
  const readStatus = afterThe<[DrekContentStatus]>({ connected: true });

  class DrekContext$OfDocument extends DrekContext {

    get window(): Window {
      return view;
    }

    get document(): Document {
      return document;
    }

    get nsAlias(): NamespaceAliaser {
      return nsAlias;
    }

    get scheduler(): RenderScheduler {
      return scheduler;
    }

    get readStatus(): AfterEvent<[DrekContentStatus]> {
      return readStatus;
    }

    [DrekContext$update__symbol](
        {
          nsAlias = nsAliasImpl,
          scheduler = schedulerImpl,
        }: DrekContext.Update,
    ): void {
      nsAliasImpl = nsAlias;
      schedulerImpl = scheduler;
    }

  }

  return document[DrekContext__symbol] = new DrekContext$OfDocument();
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
