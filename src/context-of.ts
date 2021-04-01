/**
 * Obtains and possibly updated a rendering context of the given document.
 *
 * @param document - Target document.
 * @param update - An update to target document context.
 *
 * @returns Target document rendering context updates applied.
 */
import { NamespaceAliaser, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  newRenderSchedule,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekContext } from './context';
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';
import { isDocumentFragmentNode } from './misc';

/**
 * Obtains and possibly updates a rendering context of the given document.
 *
 * @param document - Target document.
 * @param update - An update to target document context.
 *
 * @returns Target document rendering context updates applied.
 */
export function drekContextOf(document: Document, update?: DrekContext.Update): DrekContext;

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
export function drekContextOf(node: Node): DrekContext;

export function drekContextOf(node: Node, update?: DrekContext.Update): DrekContext {
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
