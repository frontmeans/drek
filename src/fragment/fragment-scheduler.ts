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
   * The content of the rendered fragment.
   *
   * The content update has no effect after the fragment is {@link DrekFragment.isRendered rendered}.
   */
  readonly content: DocumentFragment;

}
