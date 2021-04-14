import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekPlacement } from '../placement';
import { DrekTarget } from '../target';
import { DrekFragmentRenderScheduler } from './fragment-scheduler';
import { DrekFragment$Context, DrekFragment$Context__symbol } from './fragment.context.impl';

/**
 * A fragment of DOM tree, which content is to be {@link DrekTarget.placeContent placed} to the document once rendered.
 *
 * Provides separate {@link DrekContext rendering context} for its nodes.
 *
 * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
 */
export class DrekFragment<TStatus extends [DrekContentStatus] = [DrekContentStatus]> {

  /**
   * @internal
   */
  [DrekFragment$Context__symbol]: DrekFragment$Context<TStatus>;

  /**
   * Rendering target.
   *
   * When the fragment is {@link render rendered}, the rendered content is placed to this target.
   */
  get target(): DrekTarget {
    return this[DrekFragment$Context__symbol]._target;
  }

  /**
   * Inner rendering context of the fragment.
   *
   * This context as available to the {@link content} nodes.
   *
   * This context updated each time the fragment is {@link render rendered}.
   */
  get innerContext(): DrekFragment.InnerContext<TStatus> {
    return this[DrekFragment$Context__symbol];
  }

  /**
   * The content of the fragment.
   */
  get content(): DocumentFragment {
    return this[DrekFragment$Context__symbol]._content;
  }

  /**
   * An `OnEvent` sender of fragment rendering event.
   *
   * Sends a fragment content {@link DrekTarget.placeContent placement} to {@link target} when the fragment is actually
   * {@link render rendered}.
   *
   * Cuts off the event supply after sending the first event.
   */
  get whenRendered(): OnEvent<[DrekPlacement<DrekFragment.Status<TStatus>>]> {
    return this[DrekFragment$Context__symbol]._whenRendered();
  }

  /**
   * Construct rendered fragment.
   *
   * @param target - Rendering target to place the
   * @param options - Fragment rendering options.
   */
  constructor(target: DrekTarget<TStatus>, options: DrekFragment.Options = {}) {
    this[DrekFragment$Context__symbol] = DrekFragment$Context.attach(this, target, options);
  }

  /**
   * Settles previously rendered content.
   *
   * A {@link whenSettled} event sender notifies its receivers once settled.
   *
   * @returns `this` instance.
   */
  settle(): this {
    this[DrekFragment$Context__symbol]._settle();
    return this;
  }

  /**
   * Renders this fragment by {@link DrekTarget.placeContent placing} its {@link DrekFragmentRenderExecution.content
   * content} to {@link target rendering target}.
   *
   * Once rendered the fragment {@link content} becomes empty and can be reused. Its rendering context is updated.
   *
   * @returns Content {@link DrekTarget.placeContent placement} to {@link target}.
   */
  render(): DrekPlacement<DrekFragment.Status<TStatus>> {
    return this[DrekFragment$Context__symbol]._render();
  }

}

export namespace DrekFragment {

  /**
   * Rendering context provided by fragment to its content nodes.
   *
   * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
   */
  export interface InnerContext<TStatus extends [DrekContentStatus]> extends DrekContext<Status<TStatus>> {

    readonly scheduler: DrekFragmentRenderScheduler<TStatus>;

    /**
     * Tries to lift this rendering context to {@link target} one.
     *
     * @returns The {@link target} context when the fragment is rendered, or `this` instance otherwise.
     */
    lift(): DrekContext;

  }

  /**
   * A status of rendered fragment content.
   */
  export type Status<TStatus extends [DrekContentStatus]> =
      | [OwnStatus]
      | TStatus;

  /**
   * A status of rendered fragment content.
   *
   * This status is replaced by the target one
   */
  export interface OwnStatus extends DrekContentStatus {

    readonly connected: false;

    /**
     * A status of the content within a fragment.
     *
     * Can be one of:
     *
     * - `'added'` - when the content is added to the fragment, but not yet rendered.
     * - `'rendered'` - while the content is being rendered, but not yet placed to {@link DrekFragment.target target}.
     */
    readonly withinFragment: 'added' | 'rendered';

  }

  /**
   * Rendered fragment construction options.
   */
  export interface Options {

    /**
     * Namespace aliaser to use by content nodes.
     *
     * The one from the {@link DrekFragment.target.context target context} is used when omitted.
     */
    readonly nsAlias?: NamespaceAliaser;

    /**
     * Render scheduler to use by content nodes.
     *
     * A `queuedRenderScheduler` is used when omitted.
     */
    readonly scheduler?: RenderScheduler;

    /**
     * The content of constructed fragment.
     *
     * A new document fragment will be created when omitted.
     */
    readonly content?: DocumentFragment;

  }

}
