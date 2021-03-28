import { RenderExecution, RenderSchedule, RenderScheduleOptions } from '@frontmeans/render-scheduler';
import { DrekFragment } from './fragment';

/**
 * Fragment render scheduler signature.
 */
export type DrekFragmentRenderScheduler =
/**
 * @param options - Options of constructed render schedule.
 *
 * @returns New render schedule.
 */
    (this: void, options?: RenderScheduleOptions) => RenderSchedule<DrekFragmentRenderExecution>;


/**
 * Fragment render shot execution context.
 */
export interface DrekFragmentRenderExecution extends RenderExecution {

  /**
   * Rendered fragment instance.
   */
  readonly fragment: DrekFragment;

  /**
   * The content of this fragment.
   */
  readonly content: DocumentFragment;

}
