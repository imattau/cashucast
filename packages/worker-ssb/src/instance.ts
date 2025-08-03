import { useSettings } from '../../../shared/store/settings';
import { init as ssbInit } from 'ssb-browser-core/net';
import * as ssbBlobs from 'ssb-blobs';

let ssb: any = (globalThis as any).__cashuSSB;

export function getSSB() {
  if (ssb) return ssb;

  const { roomUrl } = useSettings.getState();

  ssb = ssbInit('cashucast-ssb', {}, (stack: any) =>
    stack.use(ssbBlobs)
  );

  if (roomUrl) {
    try {
      ssb.conn.remember(roomUrl, { type: 'room' });
      ssb.conn.connect(roomUrl);
    } catch (err) {
      // Connection failures are non-fatal in tests
    }
  }

  (globalThis as any).__cashuSSB = ssb;
  return ssb;
}
