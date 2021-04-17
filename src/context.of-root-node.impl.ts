import { isDocumentNode } from '@frontmeans/dom-primitives';
import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { AfterEvent, EventEmitter, OnEvent, trackValue } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekContext } from './context';
import { DrekContext$Holder, DrekContext$State, DrekContext__symbol } from './context.impl';
import { DrekContext$ofDocument } from './context.of-document.impl';
import { DrekContext$register } from './context.registrar.impl';
import { DrekFragment } from './fragment';

/**
 * @internal
 */
export function DrekContext$ofRootNode(root: DrekContext$Holder<Node>): DrekContext {
  return isDocumentNode(root) ? DrekContext$ofDocument(root) : DrekContext$unrooted(root);
}

function DrekContext$unrooted(root: DrekContext$Holder<Node>): DrekContext {

  const existing = root[DrekContext__symbol];

  if (existing) {
    return existing.lift();
  }

  const status = trackValue<DrekContentStatus>({ connected: false });
  const settled = new EventEmitter<[DrekContentStatus]>();
  let derivedCtx: DrekContext = DrekContext$ofDocument(
      root.ownerDocument! /* Not a document, so `ownerDocument` is set */,
  );
  const scheduler = new DrekContext$State(derivedCtx);
  let getFragment = (): DrekFragment | undefined => derivedCtx.fragment;
  let lift = (ctx: DrekContext): DrekContext => {

    const newRoot = root.getRootNode({ composed: true });

    if (newRoot === root) {
      return ctx;
    }

    const lifted = DrekContext$ofRootNode(newRoot);

    root[DrekContext__symbol] = undefined;
    getFragment = () => lifted.fragment;
    scheduler.set(lifted);
    lifted.whenSettled(status => settled.send(status)).cuts(settled);
    status.by(lifted);
    lift = _ctx => lifted;
    derivedCtx = lifted;

    return lifted;
  };

  class DrekContext$Unrooted extends DrekContext {

    get fragment(): DrekFragment | undefined {
      return getFragment();
    }

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

    get whenSettled(): OnEvent<[DrekContentStatus]> {
      return settled.on;
    }

    lift(): DrekContext {
      return lift(this);
    }

  }

  const context = root[DrekContext__symbol] = new DrekContext$Unrooted();

  DrekContext$register(context);

  return context;
}
