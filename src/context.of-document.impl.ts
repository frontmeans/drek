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
import { DrekContext$Holder, DrekContext__symbol } from './context.impl';
import { UpdatableScheduler } from './updatable-scheduler.impl';

/**
 * @internal
 */
export function DrekContext$ofDocument(document: DrekContext$Holder<Document>): DrekContext.Updatable {

  const existing = document[DrekContext__symbol] as DrekContext$OfDocument | undefined;

  if (existing) {
    return existing;
  }

  let nsAliasImpl = newNamespaceAliaser();
  const schedulerImpl = new UpdatableScheduler(newRenderSchedule);

  const view = document.defaultView || window;
  const nsAlias: NamespaceAliaser = ns => nsAliasImpl(ns);
  const scheduler = (
      options?: RenderScheduleOptions,
  ): RenderSchedule => schedulerImpl.scheduler({
    window: view,
    ...options,
  });
  const readStatus = afterThe<[DrekContentStatus]>({ connected: true });

  class DrekContext$OfDocument extends DrekContext implements DrekContext.Updatable {

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

    lift(): this {
      return this;
    }

    update(
        {
          nsAlias = nsAliasImpl,
          scheduler = schedulerImpl.impl,
        }: DrekContext.Update,
    ): this {
      nsAliasImpl = nsAlias;
      schedulerImpl.set(scheduler);
      return this;
    }

  }

  return document[DrekContext__symbol] = new DrekContext$OfDocument();
}
