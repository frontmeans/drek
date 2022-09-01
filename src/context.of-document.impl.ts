import { NamespaceAliaser, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  newRenderSchedule,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { AfterEvent, afterThe } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekContext } from './context';
import { DrekContext$Holder, DrekContext$State, DrekContext__symbol } from './context.impl';

/**
 * @internal
 */
export function DrekContext$ofDocument(
  document: DrekContext$Holder<Document>,
): DrekContext.Updatable {
  const existing = document[DrekContext__symbol] as DrekContext$OfDocument | undefined;

  if (existing) {
    return existing;
  }

  const state = new DrekContext$State({
    nsAlias: newNamespaceAliaser(),
    scheduler: newRenderSchedule,
  });

  const view = document.defaultView || window;
  const scheduler = (options?: RenderScheduleOptions): RenderSchedule => state.scheduler({
      window: view,
      ...options,
    });
  const readStatus = afterThe<[DrekContentStatus]>({ connected: true });

  class DrekContext$OfDocument extends DrekContext implements DrekContext.Updatable {

    get fragment(): undefined {
      return;
    }

    get window(): Window {
      return view;
    }

    get document(): Document {
      return document;
    }

    get nsAlias(): NamespaceAliaser {
      return state.nsAlias;
    }

    get scheduler(): RenderScheduler {
      return scheduler;
    }

    get readStatus(): AfterEvent<[DrekContentStatus]> {
      return readStatus;
    }

    lift(): this {
      return this;
    }

    update({ nsAlias = state._nsAlias, scheduler = state._scheduler }: DrekContext.Update): this {
      state.set({ nsAlias, scheduler });

      return this;
    }

}

  return (document[DrekContext__symbol] = new DrekContext$OfDocument());
}
