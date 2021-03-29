import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  queuedRenderScheduler,
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe, trackValue, translateAfter_ } from '@proc7ts/fun-events';
import { DrekContentStatus } from '../content-status';
import { DrekContext$Holder, DrekContext__symbol } from '../context.impl';
import { DrekTarget } from '../target';
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

  readonly scheduler: DrekFragmentRenderScheduler;
  isRendered = false;
  readonly readStatus: AfterEvent<DrekFragment.Status<TStatus>>;
  private readonly _status = trackValue<DrekFragment.Status<TStatus>>([{ connected: false }]);
  private _scheduler: RenderScheduler;

  private constructor(
      readonly fragment: DrekFragment,
      readonly target: DrekTarget<TStatus>,
      readonly content: DrekContext$Holder<DocumentFragment>,
      readonly nsAlias: NamespaceAliaser,
      scheduler: RenderScheduler,
  ) {
    this.content = content;
    this.readStatus = this._status.read.do(
        translateAfter_((send, status) => send(...status)),
    );
    this._scheduler = scheduler;
    this.scheduler = this._createSchedule.bind(this);
  }

  render(): void {
    this.render = DrekFragment$alreadyRendered;

    const schedule = this._createSchedule();

    this.isRendered = true;
    this._scheduler = this.target.context.scheduler;

    schedule(context => {
      // Await for all scheduled shots to render.
      context.postpone(() => {
        // Place the rendered content.
        this.target.context.scheduler()(() => {
          // The content is placed within target's scheduler.
          const placement = this.target.placeContent(this.content);

          this._status.by(placement, (...status) => afterThe(status));
        });
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

interface DrekFragment$Options extends DrekFragment.Options {

  readonly content?: DrekContext$Holder<DocumentFragment>;

}

function DrekFragment$alreadyRendered(): never {
  throw new TypeError('Fragment already rendered');
}
