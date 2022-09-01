import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { DrekContext } from './context';

/**
 * @internal
 */
export const DrekContext__symbol = /*#__PURE__*/ Symbol('DrekContext');

/**
 * @internal
 */
export type DrekContext$Holder<T> = T & {
  [DrekContext__symbol]?: DrekContext | undefined;
};

/**
 * @internal
 */
export class DrekContext$State {

  _nsAlias: NamespaceAliaser;
  readonly nsAlias: NamespaceAliaser;

  _scheduler: RenderScheduler;
  readonly scheduler: RenderScheduler;

  constructor({ nsAlias, scheduler }: Required<DrekContext.Update>) {
    this._nsAlias = nsAlias;
    this.nsAlias = ns => this._nsAlias(ns);

    this._scheduler = scheduler;
    this.scheduler = options => {
      let scheduler = this._scheduler;
      let schedule = scheduler(options);

      return shot => {
        if (scheduler !== this._scheduler) {
          scheduler = this._scheduler;
          schedule = scheduler(options);
        }

        return schedule(shot);
      };
    };
  }

  set({ nsAlias, scheduler }: Required<DrekContext.Update>): void {
    this._nsAlias = nsAlias;
    this._scheduler = scheduler;
  }

}
