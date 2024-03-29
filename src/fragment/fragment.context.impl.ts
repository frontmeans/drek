import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  queuedRenderScheduler,
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import {
  AfterEvent,
  afterThe,
  EventEmitter,
  onceOn,
  OnEvent,
  trackValue,
  translateAfter_,
} from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekContext$Holder, DrekContext$State, DrekContext__symbol } from '../context.impl';
import { DrekPlacement } from '../placement';
import { DrekTarget } from '../target';
import { DrekFragment } from './fragment';
import { DrekFragmentRenderExecution, DrekFragmentRenderScheduler } from './fragment-scheduler';

/**
 * @internal
 */
export const DrekFragment$Context__symbol = /*#__PURE__*/ Symbol('DrekFragment.context');

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
    } else if (content.getRootNode({ composed: true }) !== content) {
      throw new TypeError('Not a standalone DocumentFragment');
    } else if (content[DrekContext__symbol]) {
      throw new TypeError('Can not render content of another fragment');
    }

    return (content[DrekContext__symbol] = new DrekFragment$Context(
      fragment,
      target,
      content,
      nsAlias,
      scheduler,
    ));
  }

  readonly scheduler: DrekFragmentRenderScheduler<TStatus>;
  readonly readStatus: AfterEvent<DrekFragment.Status<TStatus>>;
  private readonly _status = trackValue<DrekFragment.Status<TStatus>>([
    { connected: false, withinFragment: 'added' },
  ]);

  private readonly _state: DrekContext$State;
  private readonly _settled = new EventEmitter<DrekFragment.Status<TStatus>>();
  private _getFragment: () => DrekFragment | undefined;
  private _lift: DrekContext;
  private _whenSettled?: OnEvent<DrekFragment.Status<TStatus>> | undefined;
  private readonly _rendered = new EventEmitter<[DrekPlacement<TStatus>]>();

  private constructor(
    readonly _fragment: DrekFragment<TStatus>,
    readonly _target: DrekTarget<TStatus>,
    readonly _content: DrekContext$Holder<DocumentFragment>,
    nsAlias: NamespaceAliaser,
    scheduler: RenderScheduler,
  ) {
    super();
    this._getFragment = () => _fragment as DrekFragment<any>;
    this._lift = this;
    this.readStatus = this._status.read.do(translateAfter_((send, status) => send(...status)));
    this._state = new DrekContext$State({ nsAlias, scheduler });
    this.scheduler = this._createSchedule.bind(this);

    this.whenConnected((...status) => {
      // `whenSettled` is the same as `whenConnected` now.
      this._whenSettled = this.whenConnected;
      // Send a settlement event one last time.
      this._settled.send(...status);
    });
  }

  get fragment(): DrekFragment<any> | undefined {
    return this._getFragment();
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
    return this._whenSettled || (this._whenSettled = this._settled.on.do(onceOn));
  }

  lift(): DrekContext {
    return this._lift;
  }

  _settle(): void {
    this.scheduler()(_ => {
      this._settled.send(...this._status.it);
    });
  }

  _render(): this {
    // Make the `.lift()` method return the target context.
    this._lift = this._target.context;

    // Signal the rendering started.
    this._status.it = [{ connected: false, withinFragment: 'rendered' }];

    const schedule = this._state._scheduler();

    this._state.set(this._target.context);

    schedule(({ postpone }) => {
      // Await for all scheduled shots to render.
      postpone(() => {
        this._target.context.scheduler()(() => {
          // Place the rendered content within target's scheduler.

          const placement = this._target.placeContent(this._content);

          // Update target fragment.
          this._getFragment = () => placement.fragment;

          // Reset the inner context.
          this._content[DrekContext__symbol] = this._fragment[DrekFragment$Context__symbol] =
            new DrekFragment$Context(
              this._fragment,
              this._target,
              this._content,
              this.nsAlias,
              this.scheduler,
            );

          // Derive the status from the target context.
          this._status.by(placement, (...status) => afterThe(status));

          // Send `whenRendered` event.
          this._rendered.send(placement);
        });
      });
    });

    return this;
  }

  _whenRendered(): OnEvent<[DrekPlacement<TStatus>]> {
    return (this._whenRendered = valueProvider(this._rendered.on.do(onceOn)))();
  }

  private _createSchedule(
    options: RenderScheduleOptions = {},
  ): RenderSchedule<DrekFragmentRenderExecution<TStatus>> {
    const schedule = this._state.scheduler({
      ...options,
      window: this.window,
    });

    return shot => schedule(execution => shot(this._createExecution(execution)));
  }

  private _createExecution(execution: RenderExecution): DrekFragmentRenderExecution<TStatus> {
    const fragmentExecution: DrekFragmentRenderExecution<TStatus> = {
      ...execution,
      fragment: this._fragment,
      content: this._content,
      postpone(postponed) {
        execution.postpone(_execution => postponed(fragmentExecution));
      },
    };

    return fragmentExecution;
  }

}

interface DrekFragment$Options extends DrekFragment.Options {
  readonly content?: DrekContext$Holder<DocumentFragment> | undefined;
}
