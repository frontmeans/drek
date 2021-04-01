import { RenderScheduler } from '@frontmeans/render-scheduler';

/**
 * @internal
 */
export class UpdatableScheduler {

  readonly scheduler: RenderScheduler;

  constructor(public impl: RenderScheduler) {
    this.scheduler = options => {

      let scheduler = this.impl;
      let schedule = scheduler(options);

      return shot => {
        if (scheduler !== this.impl) {
          scheduler = this.impl;
          schedule = scheduler(options);
        }
        return schedule(shot);
      };
    };
  }

  set(scheduler: RenderScheduler): void {
    this.impl = scheduler;
  }

}
