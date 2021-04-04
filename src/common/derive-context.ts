import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { AfterEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from '../content-status';
import { DrekContext } from '../context';
import { DrekContext$State } from '../context.impl';

/**
 * Creates a rendering context based on another one.
 *
 * @typeParam TStatus - A type of the tuple containing a context content status as its first element.
 * @param base - Base rendering context.
 * @param update - Context update.
 *
 * @returns Updated rendering context, or the `base` one if nothing to update.
 */
export function deriveDrekContext<TStatus extends [DrekContentStatus] = [DrekContentStatus]>(
    base: DrekContext<TStatus>,
    update: DrekContext.Update = {},
): DrekContext<TStatus> {

  const {
    nsAlias: initialNsAlias = base.nsAlias,
    scheduler: initialScheduler = base.scheduler,
  } = update;

  if (initialNsAlias === base.nsAlias && initialScheduler === base.scheduler) {
    return base;
  }

  const state = new DrekContext$State({
    nsAlias: initialNsAlias,
    scheduler: initialScheduler,
  });
  let lift = (derived: DrekContext): DrekContext => {

    const lifted = base.lift();

    if (lifted === base) {
      return derived;
    }

    state.set(lifted);
    lift = _derived => lifted;

    return lifted;
  };

  class DrekContext$Derived extends DrekContext<TStatus> {

    get window(): Window {
      return base.window;
    }

    get document(): Document {
      return base.document;
    }

    get nsAlias(): NamespaceAliaser {
      return state.nsAlias;
    }

    get scheduler(): RenderScheduler {
      return state.scheduler;
    }

    get readStatus(): AfterEvent<TStatus> {
      return base.readStatus;
    }

    lift(): DrekContext {
      return lift(this);
    }

  }

  return new DrekContext$Derived();
}
