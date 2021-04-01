import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { AfterEvent, trackValue } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekContext } from './context';
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';
import { DrekContext$ofDocument } from './context.of-document.impl';
import { isDocumentNode } from './misc';
import { UpdatableScheduler } from './updatable-scheduler.impl';

/**
 * Obtains a updatable a rendering context of the given document.
 *
 * @param document - Target document.
 *
 * @returns Updatable document rendering context.
 */
export function drekContextOf(document: Document): DrekContext.Updatable;

/**
 * Obtains a rendering context of the given node.
 *
 * If the node is connected to document, the rendering context is the one of the document. Otherwise, if the node
 * belongs to the {@link DrekFragment rendering fragment}, then the latter is used. Otherwise, a new context is created
 * and attached to the node root. The latter does not track a document connection automatically.
 * A {@link DrekContext.expand} method could be used to track the connection status manually.
 *
 * @param node - Target node.
 *
 * @returns Target node rendering context.
 */
export function drekContextOf(node: Node): DrekContext;

export function drekContextOf(node: Node): DrekContext {
  for (;;) {

    const root = node.getRootNode({ composed: true });

    if (root === node) {
      return DrekContext$ofRoot(node);
    }

    node = root;
  }
}

function DrekContext$ofRoot(root: DrekContext$Holder<Node>): DrekContext {
  return isDocumentNode(root) ? DrekContext$ofDocument(root) : DrekContext$ofRootNode(root);
}

function DrekContext$ofRootNode(root: DrekContext$Holder<Node>): DrekContext {

  const existing = root[DrekContext__symbol];

  if (existing) {
    return existing.lift();
  }

  const status = trackValue<DrekContentStatus>({ connected: false });
  let derivedCtx: DrekContext = DrekContext$ofDocument(
      root.ownerDocument! /* Not a document, so `ownerDocument` is set */,
  );
  const scheduler = new UpdatableScheduler(derivedCtx.scheduler);
  let lift = (ctx: DrekContext): DrekContext => {

    const newRoot = root.getRootNode({ composed: true });

    if (newRoot === root) {
      return ctx;
    }

    const lifted = DrekContext$ofRoot(newRoot);

    root[DrekContext__symbol] = undefined;
    scheduler.set(lifted.scheduler);
    status.by(lifted);
    lift = _ctx => lifted;
    derivedCtx = lifted;

    return lifted;
  };

  class DrekContext$OfRootNode extends DrekContext {

    get window(): Window {
      return derivedCtx.window;
    }

    get document(): Document {
      return derivedCtx.document;
    }

    get nsAlias(): NamespaceAliaser {
      return derivedCtx.nsAlias;
    }

    get scheduler(): RenderScheduler {
      return scheduler.scheduler;
    }

    get readStatus(): AfterEvent<[DrekContentStatus]> {
      return status.read;
    }

    lift(): DrekContext {
      return lift(this);
    }

  }

  return root[DrekContext__symbol] = new DrekContext$OfRootNode();
}
