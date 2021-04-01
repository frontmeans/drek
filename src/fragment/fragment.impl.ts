import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  queuedRenderScheduler,
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe, EventEmitter, onceOn, OnEvent, trackValue, translateAfter_ } from '@proc7ts/fun-events';
import { noop, valueProvider } from '@proc7ts/primitives';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';
import { DrekTarget } from '../target';
import { UpdatableScheduler } from '../updatable-scheduler.impl';
import { DrekFragment } from './fragment';
import { DrekFragmentRenderExecution, DrekFragmentRenderScheduler } from './fragment-scheduler';

/**
 * @internal
 */
export const DrekFragment$Impl__symbol = (/*#__PURE__*/ Symbol('DrekFragment.impl'));

/**
 * @internal
 */
export class DrekFragment$Impl<TStatus extends [DrekContentStatus]> {

  static attach<TStatus extends [DrekContentStatus]>(
      fragment: DrekFragment<TStatus>,
      target: DrekTarget<TStatus>,
      {
        nsAlias = target.context.nsAlias,
        scheduler = queuedRenderScheduler,
        content,
      }: DrekFragment$Options,
  ): DrekFragment$Impl<TStatus> {
    if (!content) {
      content = target.context.document.createDocumentFragment();
    } else if (content[DrekContext__symbol]) {
      throw new TypeError('Can not render content of another fragment');
    }

    content[DrekContext__symbol] = fragment;

    return new DrekFragment$Impl(
        fragment,
        target,
        content,
        nsAlias,
        scheduler,
    );
  }

  readonly scheduler: DrekFragmentRenderScheduler<TStatus>;
  isRendered = false;
  readonly readStatus: AfterEvent<DrekFragment.Status<TStatus>>;
  private readonly _status = trackValue<DrekFragment.Status<TStatus>>([{ connected: false }]);
  private readonly _scheduler: UpdatableScheduler;
  private readonly _settled = new EventEmitter<DrekFragment.Status<TStatus>>();

  private constructor(
      readonly fragment: DrekFragment<TStatus>,
      readonly target: DrekTarget<TStatus>,
      readonly content: DrekContext$Holder<DocumentFragment>,
      readonly nsAlias: NamespaceAliaser,
      scheduler: RenderScheduler,
  ) {
    this.content = content;
    this.readStatus = this._status.read.do(
        translateAfter_((send, status) => send(...status)),
    );
    this._scheduler = new UpdatableScheduler(scheduler);
    this.scheduler = this._createSchedule.bind(this);
  }

  init(): void {
    this.fragment.whenConnected((...status) => {
      // `whenSettled` is the same as `whenConnected` now.
      this.whenSettled = valueProvider(this.fragment.whenConnected);
      // Send a settlement event one last time.
      this._settled.send(...status);
    });
  }

  whenSettled(): OnEvent<DrekFragment.Status<TStatus>> {
    return (this.whenSettled = valueProvider(this._settled.on.do(
        onceOn,
    )))();
  }

  lift(): DrekContext {
    return this.fragment;
  }

  settle(): void {
    this._scheduler.impl()(context => {
      context.postpone(() => {
        this._settled.send(...this._status.it);
      });
    });
  }

  render(): void {
    this.render = DrekFragment$alreadyRendered;
    this.lift = valueProvider(this.target.context);
    this.settle = noop;

    const schedule = this._scheduler.impl();

    this.isRendered = true;
    this._scheduler.set(this.target.context.scheduler);

    schedule(context => {
      // Await for all scheduled shots to render.
      context.postpone(() => {
        this.target.context.scheduler()(() => {

          // Place the rendered content within target's scheduler.
          const placement = this.target.placeContent(this.content);

          // Derive the status from the target context.
          this._status.by(placement, (...status) => afterThe(status));
        });
      });
    });
  }

  private _createSchedule(
      initialOptions: RenderScheduleOptions = {},
      scheduler: RenderScheduler = this._scheduler.scheduler,
  ): RenderSchedule<DrekFragmentRenderExecution<TStatus>> {

    const options: RenderScheduleOptions = {
      ...initialOptions,
      window: this.fragment.window,
    };
    const schedule = scheduler(options);

    return shot => schedule(execution => shot(this._createExecution(execution)));
  }

  private _createExecution(execution: RenderExecution): DrekFragmentRenderExecution<TStatus> {
    return {
      ...execution,
      fragment: this.fragment,
      content: this.content,
      postpone(postponed) {
        execution.postpone(_execution => postponed(this));
      },
    };
  }

}

interface DrekFragment$Options extends DrekFragment.Options {

  readonly content?: DrekContext$Holder<DocumentFragment>;

}

function DrekFragment$alreadyRendered(): never {
  throw new TypeError('Fragment already rendered');
}
