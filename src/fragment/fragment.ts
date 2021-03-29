import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { AfterEvent, OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekTarget } from '../target';
import { DrekFragmentRenderScheduler } from './fragment-scheduler';
import { DrekFragment$Impl, DrekFragment$Impl__symbol } from './fragment.impl';

/**
 * A fragment of DOM tree, which content is to be {@link DrekTarget.placeContent placed} to the document once rendered.
 *
 * It serves as {@link DrekContext rendering context} for its nodes.
 *
 * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
 */
export class DrekFragment<TStatus extends [DrekContentStatus] = [DrekContentStatus]>
    extends DrekContext<DrekFragment.Status<TStatus>> {

  /**
   * @internal
   */
  private [DrekFragment$Impl__symbol]: DrekFragment$Impl<TStatus>;

  get window(): Window {
    return this.target.context.window;
  }

  get document(): Document {
    return this.target.context.document;
  }

  /**
   * Rendering target.
   *
   * When the fragment is {@link render rendered}, the rendered content is placed to this target.
   */
  get target(): DrekTarget {
    return this[DrekFragment$Impl__symbol].target;
  }

  get nsAlias(): NamespaceAliaser {
    return this[DrekFragment$Impl__symbol].nsAlias;
  }

  /**
   * A render scheduler to use to build the fragment contents.
   *
   * After the fragment is {@link render rendered} switches to the {@link target} context's one.
   */
  get scheduler(): DrekFragmentRenderScheduler<TStatus> {
    return this[DrekFragment$Impl__symbol].scheduler;
  }

  /**
   * An `AfterEvent` keeper of fragment content status.
   */
  get readStatus(): AfterEvent<DrekFragment.Status<TStatus>> {
    return this[DrekFragment$Impl__symbol].readStatus;
  }

  /**
   * An `OnEvent` sender of a settlement event.
   *
   * This event is sent each time the {@link settle} method called and when the fragment is {@link render rendered}.
   *
   * After the fragment is {@link render rendered}, this is the same as {@link whenConnected}.
   */
  get whenSettled(): OnEvent<DrekFragment.Status<TStatus>> {
    return this[DrekFragment$Impl__symbol].whenSettled();
  }

  /**
   * Whether this fragment is rendered already.
   *
   * This flag is set immediately on {@link render} call.
   */
  get isRendered(): boolean {
    return this[DrekFragment$Impl__symbol].isRendered;
  }

  /**
   * Construct rendered fragment.
   *
   * @param target - Rendering target to place the
   * @param options - Fragment rendering options.
   */
  constructor(target: DrekTarget<TStatus>, options: DrekFragment.Options = {}) {
    super();

    const impl = this[DrekFragment$Impl__symbol] = DrekFragment$Impl.attach(this, target, options);

    impl.init();
  }

  /**
   * Settles previously rendered content.
   *
   * A {@link whenSettled} event sender notifies its receivers once settled.
   *
   * Has no effect after the fragment is {@link isRendered rendered}.
   *
   * @returns `this` instance.
   */
  settle(): this {
    this[DrekFragment$Impl__symbol].settle();
    return this;
  }

  /**
   * Renders this fragment by {@link DrekTarget.placeContent placing} its {@link DrekFragmentRenderExecution.content
   * content} to {@link target rendering target}.
   *
   * Once rendered the fragment can no longer be used to render anything.
   *
   * @returns `this` instance as a result of content {@link DrekTarget.placeContent placement}.
   */
  render(): this {
    this[DrekFragment$Impl__symbol].render();
    return this;
  }

}

export namespace DrekFragment {

  /**
   * A status of rendered fragment content.
   */
  export type Status<TStatus extends [DrekContentStatus]> =
      | [OwnStatus]
      | TStatus;

  /**
   * Initial rendered fragment content status.
   */
  export interface OwnStatus extends DrekContentStatus {

    readonly connected: false;

  }

  /**
   * Rendered fragment construction options.
   */
  export interface Options {

    /**
     * Namespace aliaser to use.
     *
     * The one from the {@link DrekFragment.target.context target context} is used when omitted.
     */
    readonly nsAlias?: NamespaceAliaser;

    /**
     * Render scheduler to use.
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
