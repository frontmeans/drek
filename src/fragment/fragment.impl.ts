import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  queuedRenderScheduler,
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe, trackValue, translateAfter_ } from '@proc7ts/fun-events';
import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';
import { DrekContentStatus, DrekTarget } from '../target';
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
      fragment: DrekFragment,
      target: DrekTarget<TStatus>,
      {
        nsAlias = target.context.nsAlias,
        scheduler = queuedRenderScheduler,
        content = target.context.document.createDocumentFragment(),
      }: DrekFragment$Options = {},
      ): DrekFragment$Impl<TStatus> {
    if (content[DrekContext__symbol]) {
      throw new TypeError('Fragment already rendered');
    }

    content[DrekContext__symbol] = fragment;

    return new DrekFragment$Impl(
        fragment,
        target,
        nsAlias,
        scheduler,
        content,
    );
  }

  scheduler: DrekFragmentRenderScheduler;
  readonly readStatus: AfterEvent<DrekFragment.Status<TStatus>>;
  private readonly _status = trackValue<DrekFragment.Status<TStatus>>([{ connected: false }]);
  private readonly _scheduler: RenderScheduler;

  private constructor(
      readonly fragment: DrekFragment,
      readonly target: DrekTarget<TStatus>,
      readonly nsAlias: NamespaceAliaser,
      scheduler: RenderScheduler,
      readonly content: DrekContext$Holder<DocumentFragment>,
  ) {
    this.content = content;
    this.readStatus = this._status.read.do(
        translateAfter_((send, status) => send(...status)),
    );
    this._scheduler = scheduler;
    this.scheduler = this._createSchedule.bind(this);
  }

  render(): void {

    const schedule = this.scheduler();

    this.render = DrekFragment$alreadyRendered;
    this.scheduler = DrekFragment$alreadyRendered;

    schedule(context => {
      // Await for all scheduled shots to render.
      context.postpone(() => {
        // Place the rendered content.
        const placement = this.target.placeContent(this.content);

        this._status.by(placement, (...status) => afterThe(status));
      });
    });
  }

  private _createSchedule(
      initialOptions: RenderScheduleOptions = {},
  ): RenderSchedule<DrekFragmentRenderExecution> {

    const options: RenderScheduleOptions = {
      ...initialOptions,
      window: this.fragment.window,
    };
    const schedule = this._scheduler(options);

    return shot => schedule(execution => shot(this._createExecution(execution)));
  }

  private _createExecution(execution: RenderExecution): DrekFragmentRenderExecution {
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

function DrekFragment$alreadyRendered(): never {
  throw new TypeError('Fragment already rendered');
}

interface DrekFragment$Options extends DrekFragment.Options {

  readonly content?: DrekContext$Holder<DocumentFragment>;

}
