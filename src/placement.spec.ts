import { afterSupplied, trackValue, ValueTracker } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { DrekContentStatus } from './content-status';
import { DrekPlacement } from './placement';

describe('DrekPlacement', () => {

  interface TestStatus extends DrekContentStatus {

    readonly custom: string;

  }

  let contentStatus: ValueTracker<TestStatus>;
  let placement: DrekPlacement<[TestStatus]>;

  beforeEach(() => {
    contentStatus = trackValue({ connected: false, custom: 'initial' });

    class TestPlacement extends DrekPlacement<[TestStatus]> {

      readStatus = contentStatus.read;

      fragment = undefined;

    }

    placement = new TestPlacement();
  });

  describe('[AfterEvent__symbol]', () => {
    it('returns the value of `readStatus`', () => {
      expect(afterSupplied(placement)).toBe(placement.readStatus);
    });
  });

  describe('onceConnected', () => {
    it('reports status when connected', () => {

      let status: DrekContentStatus | undefined;

      placement.onceConnected(s => status = s);
      expect(status).toBeUndefined();

      contentStatus.it = { connected: false, custom: 'disconnected' };
      expect(status).toBeUndefined();

      contentStatus.it = { connected: true, custom: 'connected' };
      expect(status).toEqual(contentStatus.it);

      contentStatus.it = { connected: true, custom: 'reconnected' };
      expect(status).toEqual(contentStatus.it);
    });
    it('is cached', () => {
      expect(placement.onceConnected).toBe(placement.onceConnected);
    });
    it('does not cut off supply', () => {

      const supply = placement.onceConnected(noop).supply;

      contentStatus.it = { connected: true, custom: 'connected' };
      expect(supply.isOff).toBe(false);
      supply.off();
    });
  });

  describe('whenConnected', () => {
    it('reports status when connected', () => {

      let status: DrekContentStatus | undefined;

      placement.whenConnected(s => status = s);
      expect(status).toBeUndefined();

      contentStatus.it = { connected: false, custom: 'disconnected' };
      expect(status).toBeUndefined();

      contentStatus.it = { connected: true, custom: 'connected' };
      expect(status).toEqual(contentStatus.it);
    });
    it('is cached', () => {
      expect(placement.whenConnected).toBe(placement.whenConnected);
    });
    it('cuts off supply after sending status', () => {

      const supply = placement.whenConnected(noop).supply;

      contentStatus.it = { connected: true, custom: 'connected' };
      expect(supply.isOff).toBe(true);
    });
  });
});
