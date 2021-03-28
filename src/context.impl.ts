import { NamespaceAliaser, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  newRenderSchedule,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe } from '@proc7ts/fun-events';
import { DrekContext } from './context';
import { DrekContentStatus } from './target';

/**
 * @internal
 */
export const DrekContext__symbol = (/*#__PURE__*/ Symbol('DrekContext'));

/**
 * @internal
 */
export type DrekContext$Holder<T> = T & {

  [DrekContext__symbol]?: DrekContext;

};

/**
 * @internal
 */
export function DrekContext$ofDocument(document: DrekContext$Holder<Document>): DrekContext {

  const existing = document[DrekContext__symbol];

  if (existing) {
    return existing;
  }

  const nsAlias = newNamespaceAliaser();
  const view = document.defaultView || window;
  const scheduler = (
      options?: RenderScheduleOptions,
  ): RenderSchedule => newRenderSchedule({
    window: view,
    ...options,
  });
  const readStatus = afterThe<[DrekContentStatus]>({ connected: true });

  class DrekContext$Default extends DrekContext {

    get window(): Window {
      return view;
    }

    get document(): Document {
      return document;
    }

    get nsAlias(): NamespaceAliaser {
      return nsAlias;
    }

    get scheduler(): RenderScheduler {
      return scheduler;
    }

    get readStatus(): AfterEvent<[DrekContentStatus]> {
      return readStatus;
    }

  }

  return document[DrekContext__symbol] = new DrekContext$Default();
}
