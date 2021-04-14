import { DrekContext } from '../context';
import { DrekContext$setRegistrar } from '../context.registrar.impl';

/**
 * Executes a DOM builder function and then {@link DrekContext.lift lifts} all unrooted rendering contexts created by
 * it.
 *
 * This helps to track a {@link DrekContext.whenConnected document connection} or {@link DrekContext.whenSettled
 * settlement} of any unrooted rendering contexts that created before its node added to document or
 * {@link DrekFragment rendered fragment}. This may happen e.g. when the rendering context {@link drekContextOf
 * accessed} from inside a custom element constructor when calling `document.createElement('custom-element')`.
 *
 * @typeParam TResult - DOM builder result type.
 * @param builder - A DOM builder function to call.
 *
 * @returns The value returned from DOM `builder` function.
 */
export function drekBuild<TResult>(builder: (this: void) => TResult): TResult {

  const registered: DrekContext[] = [];
  const resetRegistrar = DrekContext$setRegistrar(context => registered.push(context));

  try {
    return builder();
  } finally {

    const registrar = resetRegistrar();

    for (const context of registered) {

      const lifted = context.lift();

      if (lifted === context) {
        // Not lifted.
        // Try next time.
        registrar(context);
      }
    }
  }
}
