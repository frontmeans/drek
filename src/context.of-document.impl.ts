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

const DrekContext$update__symbol = (/*#__PURE__*/ Symbol('DrekContext.update'));

/**
 * @internal
 */
export function DrekContext$ofDocument(
    document: DrekContext$Holder<Document>,
    update?: DrekContext.Update,
): DrekContext {

  const existing = document[DrekContext__symbol] as DrekContext$OfDocument | undefined;

  if (existing) {
    if (update) {
      existing[DrekContext$update__symbol](update);
    }
    return existing;
  }

  const options = update || {};

  let { nsAlias: nsAliasImpl = newNamespaceAliaser() } = options;
  const { scheduler: initialScheduler = newRenderSchedule } = options;

  const view = document.defaultView || window;
  const nsAlias: NamespaceAliaser = ns => nsAliasImpl(ns);
  const schedulerImpl = new UpdatableScheduler(initialScheduler);
  const scheduler = (
      options?: RenderScheduleOptions,
  ): RenderSchedule => schedulerImpl.scheduler({
    window: view,
    ...options,
  });
  const readStatus = afterThe<[DrekContentStatus]>({ connected: true });

  class DrekContext$OfDocument extends DrekContext {

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

    [DrekContext$update__symbol](
        {
          nsAlias = nsAliasImpl,
          scheduler = schedulerImpl.impl,
        }: DrekContext.Update,
    ): void {
      nsAliasImpl = nsAlias;
      schedulerImpl.set(scheduler);
    }

  }

  return document[DrekContext__symbol] = new DrekContext$OfDocument();
}
