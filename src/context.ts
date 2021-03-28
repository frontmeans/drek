import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { DrekContext$Holder, DrekContext$ofDocument, DrekContext__symbol } from './context.impl';
import { isDocumentFragmentNode } from './misc';
import { DrekContentStatus, DrekPlacement } from './target';

/**
 * Document rendering context.
 *
 * @typeParam TStatus - A type of the tuple containing a context content status as its first element.
 */
export abstract class DrekContext<TStatus extends [DrekContentStatus] = [DrekContentStatus]>
    extends DrekPlacement<TStatus> {

  /**
   * Obtains a rendering context of the given node.
   *
   * The rendering context is provided to the node by the closest {@link DrekFragment rendering fragment}. If the node
   * does not belong to any fragment, then the context is the one of the document.
   *
   * @param node - Target node.
   *
   * @returns Document rendering context with respect to the given defaults.
   */
  static of(node: Node): DrekContext {
    for (;;) {

      const root = node.getRootNode({ composed: true });

      if (root === node) {
        if (isDocumentFragmentNode(node)) {

          const { [DrekContext__symbol]: fragmentCtx }: DrekContext$Holder<DocumentFragment> = node;

          if (fragmentCtx) {
            return fragmentCtx;
          }
        }

        return DrekContext$ofDocument(node.ownerDocument || (node as Document));
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

}
