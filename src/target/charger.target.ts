import { removeNodeContent } from '@frontmeans/dom-primitives';
import { html__naming, isQualifiedName, QualifiedName } from '@frontmeans/namespace-aliaser';
import { DrekContentStatus } from '../content-status';
import { Drek__NS } from '../drek.ns';
import { DrekPlacement } from '../placement';
import { DrekTarget } from './target';

/**
 * Creates a rendering target that charges rendered content prior to placing it to another target.
 *
 * @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
 * @param target - Rendering target of charged content.
 * @param spec - Content charging options.
 *
 * @returns Rendering target.
 */
export function drekCharger<TStatus extends [DrekContentStatus] = [DrekContentStatus]>(
    target: DrekTarget<TStatus>,
    spec?: DrekCharger.Spec<TStatus>,
): DrekTarget {

  const charger = DrekCharger$custom(target, spec);

  return {
    context: target.context,
    placeContent(content: Node): DrekPlacement {
      return charger.charge(content, target);
    },
  }
}

export namespace DrekCharger {

  /**
   * Rendered content charger specifier.
   *
   * Can be one of:
   *
   * - A qualified name of DOM element that wraps the rendered content. This element would be created with
   *   `display: contents;` style.
   * - A {@link Custom custom charger}.
   * - A {@link Factory charger factory} function.
   * - `null`/`undefined` to wrap the rendered contents into DOM element with `display: contents;` style and predefined
   *   tag name (`content` in {@link Drek__NS Drek namespace}).
   *
   *  @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
   */
  export type Spec<TStatus extends [DrekContentStatus] = [DrekContentStatus]> =
      | QualifiedName
      | Custom
      | Factory<TStatus>
      | null
      | undefined;

  /**
   * Custom rendered content charger.
   */
  export interface Custom {

    /**
     * Charges rendered content by representing it as another DOM node.
     *
     * @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
     * @param content - Rendered content to charge.
     * @param target - Rendering target to place the charged content to.
     *
     * @returns Charged content placement status.
     */
    charge<TStatus extends [DrekContentStatus]>(content: Node, target: DrekTarget<TStatus>): DrekPlacement<TStatus>;

  }

  /**
   * Rendered content charger factory signature.
   *
   * @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
   */
  export type Factory<TStatus extends [DrekContentStatus] = [DrekContentStatus]> =
  /**
   * @param target - A target to render the charged content to.
   *
   * @returns Rendered content charger specifier.
   */
      (this: void, target: DrekTarget<TStatus>) => Spec;

}

const DrekCharger$defaultTagName: QualifiedName = ['content', Drek__NS];

function DrekCharger$custom<TStatus extends [DrekContentStatus]>(
    target: DrekTarget<TStatus>,
    spec: DrekCharger.Spec<TStatus>,
): DrekCharger.Custom {
  if (typeof spec === 'function') {
    return DrekCharger$custom(target, spec(target));
  }
  if (isQualifiedName(spec)) {
    return DrekCharger$elementWrapper(target, spec);
  }
  if (spec) {
    return spec;
  }
  return DrekCharger$elementWrapper(target, DrekCharger$defaultTagName);
}

function DrekCharger$elementWrapper(
    { context: { document, nsAlias } }: DrekTarget,
    name: QualifiedName,
): DrekCharger.Custom {

  const tagName = html__naming.name(name, nsAlias);
  let renderTag = <TStatus extends [DrekContentStatus]>(
      content: Node,
      target: DrekTarget<TStatus>,
  ): DrekPlacement<TStatus> => {

    const element = document.createElement(tagName);
    let placement: DrekPlacement<TStatus>;

    element.style.display = 'contents';

    renderTag = (content, _target) => {
      removeNodeContent(element);
      element.append(content);
      return placement;
    };

    element.append(content);

    return placement = target.placeContent(element)
  };

  return {
    charge: (content, target) => renderTag(content, target),
  };
}
