import type { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import type { RenderScheduler } from '@frontmeans/render-scheduler';
import { DrekContext$createForDocument, DrekContext$Holder, DrekContext__symbol } from './context.impl';

/**
 * Document rendering context.
 */
export interface DrekContext {

  /**
   * Namespace aliaser to use.
   */
  readonly nsAlias: NamespaceAliaser;

  /**
   * Render scheduler to use.
   */
  readonly scheduler: RenderScheduler;

}

export namespace DrekContext {

  /**
   * Document rendering defaults.
   *
   * Passed to {@link of} to specify default rendering context values.
   */
  export interface Defaults {

    /**
     * Namespace aliaser to use by default.
     */
    readonly nsAlias?: NamespaceAliaser;

    /**
     * Render scheduler to use by default.
     */
    readonly scheduler?: RenderScheduler;

  }

}

export const DrekContext = {

  /**
   * Obtains a rendering context applicable to the given node.
   *
   * @param node - Target node.
   * @param defaults - Rendering defaults.
   *
   * @returns Document rendering context with respect to the given defaults.
   */
  of(this: void, node: Node, defaults?: DrekContext.Defaults): DrekContext {

    let holder: DrekContext$Holder<Document> | null = node.ownerDocument;

    if (!holder) {
      holder = node as DrekContext$Holder<Document>;
    }

    const getContext: (
        this: void,
        defaults?: DrekContext.Defaults,
    ) => DrekContext = holder[DrekContext__symbol]
        || (holder[DrekContext__symbol] = DrekContext$createForDocument(holder));

    return getContext(defaults);
  },

};
