import { AfterEvent, AfterEvent__symbol, EventKeeper, OnEvent } from '@proc7ts/fun-events';
import { DrekContentStatus } from './content-status';
import { DrekFragment } from './fragment';
import { DrekPlacement$Status, DrekPlacement$Status__symbol } from './placement.status.impl';

/**
 * A rendered content placement.
 *
 * @typeParam TStatus - A type of the tuple containing a rendered content status as its first element.
 */
export abstract class DrekPlacement<TStatus extends [DrekContentStatus] = [DrekContentStatus]>
  implements EventKeeper<TStatus> {

  /**
   * An `AfterEvent` keeper of content placement status.
   */
  abstract readonly readStatus: AfterEvent<TStatus>;

  /**
   * @internal
   */
  private readonly [DrekPlacement$Status__symbol]: DrekPlacement$Status<TStatus>;

  constructor() {
    this[DrekPlacement$Status__symbol] = new DrekPlacement$Status(this);
  }

  /**
   * A {@link DrekFragment fragment} the content is placed to, if any.
   */
  abstract readonly fragment: DrekFragment | undefined;

  /**
   * An alias of {@link readStatus}.
   *
   * @returns An `AfterEvent` keeper of content placement status.
   */
  [AfterEvent__symbol](): AfterEvent<TStatus> {
    return this.readStatus;
  }

  /**
   * An `OnEvent` sender of placed content connection event.
   *
   * The registered receiver is called when placed content is {@link DrekContentStatus.connected connected}.
   * If connected already the receiver is called immediately.
   */
  get onceConnected(): OnEvent<TStatus> {
    return this[DrekPlacement$Status__symbol].onceConnected();
  }

  /**
   * An `OnEvent` sender of single placed content connection event.
   *
   * The registered receiver is called when placed content is {@link DrekContentStatus.connected connected}.
   * If connected already the receiver is called immediately.
   *
   * In contrast to {@link onceConnected}, cuts off the event supply after sending the first event.
   */
  get whenConnected(): OnEvent<TStatus> {
    return this[DrekPlacement$Status__symbol].whenConnected();
  }

}
