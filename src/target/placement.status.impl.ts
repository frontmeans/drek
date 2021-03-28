import { AfterEvent, onceOn, OnEvent, onEventBy } from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
import { DrekContentStatus } from './content-status';
import { DrekPlacement } from './placement';

/**
 * @internal
 */
export const DrekPlacement$Status__symbol = (/*#__PURE__*/ Symbol('DrekPlacement.status'));

/**
 * @internal
 */
export class DrekPlacement$Status<TStatus extends [DrekContentStatus]> {

  constructor(readonly placement: DrekPlacement<TStatus>) {
  }

  onceConnected(): OnEvent<TStatus> {
    return (this.onceConnected = valueProvider(this.placement.readStatus.do(
        DrekPlacement$once<TStatus>(({ connected }) => connected),
    )))();
  }

  whenConnected(): OnEvent<TStatus> {
    return (this.whenConnected = valueProvider(this.onceConnected().do(
        onceOn,
    )))();
  }

}

function DrekPlacement$once<TStatus extends [DrekContentStatus]>(
    test: (...status: TStatus) => boolean,
): (input: AfterEvent<TStatus>) => OnEvent<TStatus> {
  return input => onEventBy(receiver => {

    let value = false;

    input({
      supply: receiver.supply,
      receive(eventCtx, ...status) {

        const newValue = test(...status);

        if (newValue && !value) {
          value = newValue;
          receiver.receive(eventCtx, ...status);
        }
      },
    });
  });
}
