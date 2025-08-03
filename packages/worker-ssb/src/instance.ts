import { useSettings } from '../../../shared/store/settings';

// `ssb-browser-core/net` is a CommonJS module which doesn't expose a default
// export when bundled for ESM environments (such as Vite). Using a static ES
// import therefore fails at runtime with "does not provide an export named
// 'default'". By loading the module dynamically we can access the `init`
// function from the module namespace regardless of how the bundler expresses
// its exports.
const { init: initSSB } = await import('ssb-browser-core/net.js');

let ssb: any = (globalThis as any).__cashuSSB;

export function getSSB() {
  if (ssb) return ssb;

  const { roomUrl } = useSettings.getState();

  ssb = initSSB('cashucast-ssb');

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
