import {
  RenderExecution,
  RenderSchedule,
  RenderScheduleOptions,
} from '@frontmeans/render-scheduler';
import { DrekContentStatus } from '../content-status';
import { DrekFragment } from './fragment';

/**
 * Fragment render scheduler signature.
 *
 * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
 */
export type DrekFragmentRenderScheduler<TStatus extends [DrekContentStatus] = [DrekContentStatus]> =
  /**
   * @param options - Options of constructed render schedule.
   *
   * @returns New render schedule.
   */
  (
    this: void,
    options?: RenderScheduleOptions,
  ) => RenderSchedule<DrekFragmentRenderExecution<TStatus>>;

/**
 * Fragment render shot execution context.
 *
 * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
 */
export interface DrekFragmentRenderExecution<
  TStatus extends [DrekContentStatus] = [DrekContentStatus],
> extends RenderExecution {
  /**
   * Rendered fragment instance.
   */
  readonly fragment: DrekFragment<TStatus>;

  /**
   * The content of the rendered fragment.
   */
  readonly content: DocumentFragment;
}
