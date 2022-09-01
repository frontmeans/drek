import { nodeDocument } from '@frontmeans/dom-primitives';
import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { cxDefaultScoped, CxEntry, CxGlobals, cxSingle } from '@proc7ts/context-values';
import { DrekContext } from './context';
import { drekContextOf } from './context-of';

/**
 * Document render kit instance.
 */
export interface DocumentRenderKit {
  /**
   * Obtains a rendering context of the given DOM node.
   *
   * Does the same as {@link drekContextOf} function, and also makes sure that the rendering context for the document
   * is initialized with global `RenderScheduler` and `NamespaceAliaser`.
   *
   * @param node - Target DOM node.
   *
   * @returns Target node rendering context.
   */
  contextOf(node: Node): DrekContext;
}

/**
 * Context entry containing {@link DocumentRenderKit} instance.
 *
 * Initiated lazily. So the replacement should be provided before the kit used for the first time.
 *
 * Constructs global render kit instance by default.
 */
export const DocumentRenderKit: CxEntry<DocumentRenderKit> = {
  perContext: /*#__PURE__*/ cxDefaultScoped(
    CxGlobals,
    /*#__PURE__*/ cxSingle({
      byDefault: DocumentRenderKit$byDefault,
    }),
  ),
  toString: () => '[DocumentRenderKit]',
};

function DocumentRenderKit$byDefault(target: CxEntry.Target<DocumentRenderKit>): DocumentRenderKit {
  const docs = new WeakMap<Document, 1>();
  const initDoc = (doc: Document): void => {
    if (!docs.get(doc)) {
      docs.set(doc, 1);
      drekContextOf(doc).update({
        nsAlias: target.get(NamespaceAliaser),
        scheduler: target.get(RenderScheduler),
      });
    }
  };

  return {
    contextOf(node: Node): DrekContext {
      initDoc(nodeDocument(node));

      return drekContextOf(node);
    },
  };
}
