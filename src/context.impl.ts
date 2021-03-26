import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newRenderSchedule, RenderSchedule, RenderScheduleOptions } from '@frontmeans/render-scheduler';
import { lazyValue } from '@proc7ts/primitives';
import { DrekContext } from './context';

/**
 * @internal
 */
export const DrekContext__symbol = (/*#__PURE__*/ Symbol('DrekContext'));

/**
 * @internal
 */
export type DrekContext$Holder<T> = T & {

  [DrekContext__symbol]?(this: void, defaults?: DrekContext.Defaults): DrekContext;

};

/**
 * @internal
 */
export function DrekContext$createForDocument(
    document: Document,
): (defaults?: DrekContext.Defaults) => DrekContext {

  const view = document.defaultView || window;
  const fallbackNsAlias = lazyValue(newNamespaceAliaser);
  const fallbackScheduler = (
      options?: RenderScheduleOptions,
  ): RenderSchedule => newRenderSchedule({
    window: view,
    ...options,
  });
  const fallbackContext = lazyValue((): DrekContext => ({
    nsAlias: fallbackNsAlias(),
    scheduler: fallbackScheduler,
  }));

  return defaults => {
    if (defaults) {

      const { nsAlias = fallbackNsAlias(), scheduler = fallbackScheduler } = defaults;

      return {
        nsAlias,
        scheduler,
      };
    }

    return fallbackContext();
  };
}
