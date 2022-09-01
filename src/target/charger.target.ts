import { DrekContentStatus } from '../content-status';
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
    host: target.host,
    placeContent(content: Node): DrekPlacement {
      return charger.charge(content, target);
    },
  };
}

export namespace DrekCharger {
  /**
   * Rendered content charger specifier.
   *
   * Can be one of:
   *
   * - An arbitrary string containing a text for enclosing comments.
   * - A {@link Custom custom charger}.
   * - A {@link Factory charger factory} function.
   * - `null`/`undefined` to enclose the rendered contents in comments with random text.
   *
   *  @typeParam TStatus - A tuple type reflecting a content {@link DrekContentStatus placement status}.
   */
  export type Spec<TStatus extends [DrekContentStatus] = [DrekContentStatus]> =
    | string
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
    charge<TStatus extends [DrekContentStatus]>(
      content: Node,
      target: DrekTarget<TStatus>,
    ): DrekPlacement<TStatus>;
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

function DrekCharger$custom<TStatus extends [DrekContentStatus]>(
  target: DrekTarget<TStatus>,
  spec: DrekCharger.Spec<TStatus>,
): DrekCharger.Custom {
  if (typeof spec === 'function') {
    return DrekCharger$custom(target, spec(target));
  }
  if (typeof spec === 'string') {
    return DrekCharger$commentWrapper(target, spec);
  }
  if (spec) {
    return spec;
  }

  return DrekCharger$commentWrapper(target, Math.random().toString(32).substr(2));
}

function DrekCharger$commentWrapper(
  { context: { document } }: DrekTarget,
  rem: string,
): DrekCharger.Custom {
  let wrapContent = <TStatus extends [DrekContentStatus]>(
    content: Node,
    target: DrekTarget<TStatus>,
  ): DrekPlacement<TStatus> => {
    const start = document.createComment(` [[ ${rem} [[ `);
    const end = document.createComment(` ]] ${rem} ]] `);
    let placement: DrekPlacement<TStatus>;

    wrapContent = (content, _target) => {
      const range = document.createRange();

      range.setStartAfter(start);
      range.setEndBefore(end);
      range.deleteContents();
      range.insertNode(content);

      return placement;
    };

    const fragment = document.createDocumentFragment();

    fragment.append(start, content, end);

    return (placement = target.placeContent(fragment));
  };

  return {
    charge: (content, target) => wrapContent(content, target),
  };
}
