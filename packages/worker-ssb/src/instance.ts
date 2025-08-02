import { useSettings } from '../../../shared/store/settings';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let ssb: any = (globalThis as any).__cashuSSB;

export function getSSB() {
  if (ssb) return ssb;

  const net = require('ssb-browser-core/net');
  const { roomUrl } = useSettings.getState();

  ssb = net.init('cashucast-ssb', {}, (stack: any) =>
    stack.use(require('ssb-blobs'))
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
