import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  queuedRenderScheduler,
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe, EventEmitter, onceOn, OnEvent, trackValue, translateAfter_ } from '@proc7ts/fun-events';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekContext$Holder, DrekContext$State, DrekContext__symbol } from '../context.impl';
import { DrekTarget } from '../target';
import { DrekFragment } from './fragment';
import { DrekFragmentRenderExecution, DrekFragmentRenderScheduler } from './fragment-scheduler';

/**
 * @internal
 */
export const DrekFragment$Context__symbol = (/*#__PURE__*/ Symbol('DrekFragment.context'));

/**
 * @internal
 */
export class DrekFragment$Context<TStatus extends [DrekContentStatus]>
    extends DrekContext<DrekFragment.Status<TStatus>>
    implements DrekFragment.InnerContext<TStatus> {

  static attach<TStatus extends [DrekContentStatus]>(
      fragment: DrekFragment<TStatus>,
      target: DrekTarget<TStatus>,
      {
        nsAlias = target.context.nsAlias,
        scheduler = queuedRenderScheduler,
        content,
      }: DrekFragment$Options,
  ): DrekFragment$Context<TStatus> {
    if (!content) {
      content = target.context.document.createDocumentFragment();
    } else if (content[DrekContext__symbol]) {
      throw new TypeError('Can not render content of another fragment');
    }

    return content[DrekContext__symbol] = new DrekFragment$Context(
        fragment,
        target,
        content,
        nsAlias,
        scheduler,
    );
  }

  readonly scheduler: DrekFragmentRenderScheduler<TStatus>;
  readonly readStatus: AfterEvent<DrekFragment.Status<TStatus>>;
  private readonly _status = trackValue<DrekFragment.Status<TStatus>>([{ connected: false }]);
  private readonly _state: DrekContext$State;
  private readonly _settled = new EventEmitter<DrekFragment.Status<TStatus>>();
  private _lift: DrekContext;
  private _whenSettled?: OnEvent<DrekFragment.Status<TStatus>>;

  private constructor(
      readonly _fragment: DrekFragment<TStatus>,
      readonly _target: DrekTarget<TStatus>,
      readonly _content: DrekContext$Holder<DocumentFragment>,
      nsAlias: NamespaceAliaser,
      scheduler: RenderScheduler,
  ) {
    super();
    this._lift = this;
    this.readStatus = this._status.read.do(
        translateAfter_((send, status) => send(...status)),
    );
    this._state = new DrekContext$State({ nsAlias, scheduler });
    this.scheduler = this._createSchedule.bind(this);

    this.whenConnected((...status) => {
      // `whenSettled` is the same as `whenConnected` now.
      this._whenSettled = this.whenConnected;
      // Send a settlement event one last time.
      this._settled.send(...status);
    });
  }

  get window(): Window {
    return this._target.context.window;
  }

  get document(): Document {
    return this._target.context.document;
  }

  get nsAlias(): NamespaceAliaser {
    return this._state.nsAlias;
  }

  get whenSettled(): OnEvent<DrekFragment.Status<TStatus>> {
    return this._whenSettled || (this._whenSettled = this._settled.on.do(
        onceOn,
    ));
  }

  lift(): DrekContext {
    return this._lift;
  }

  _settle(): void {
    this._state._scheduler()(context => {
      context.postpone(() => {
        this._settled.send(...this._status.it);
      });
    });
  }

  _render(): this {
    this._lift = this._target.context;

    const schedule = this._state._scheduler();

    this._state.set(this._target.context);

    schedule(context => {
      // Await for all scheduled shots to render.
      context.postpone(() => {
        this._target.context.scheduler()(() => {

          // Place the rendered content within target's scheduler.
          const placement = this._target.placeContent(this._content);

          this._content[DrekContext__symbol] = this._fragment[DrekFragment$Context__symbol] = new DrekFragment$Context(
              this._fragment,
              this._target,
              this._content,
              this.nsAlias,
              this.scheduler,
          );

          // Derive the status from the target context.
          this._status.by(placement, (...status) => afterThe(status));
        });
      });
    });
    return this;
  }

  private _createSchedule(
      initialOptions: RenderScheduleOptions = {},
      scheduler: RenderScheduler = this._state.scheduler,
  ): RenderSchedule<DrekFragmentRenderExecution<TStatus>> {

    const options: RenderScheduleOptions = {
      ...initialOptions,
      window: this.window,
    };
    const schedule = scheduler(options);

    return shot => schedule(execution => shot(this._createExecution(execution)));
  }

  private _createExecution(execution: RenderExecution): DrekFragmentRenderExecution<TStatus> {
    return {
      ...execution,
      fragment: this._fragment,
      content: this._content,
      postpone(postponed) {
        execution.postpone(_execution => postponed(this));
      },
    };
  }

}

interface DrekFragment$Options extends DrekFragment.Options {

  readonly content?: DrekContext$Holder<DocumentFragment>;

}
