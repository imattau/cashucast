/*
 * Licensed under GPL-3.0-or-later
 * instance module.
 */
import { useSettings } from '../../../shared/store/settings';
import randomAccessIdb from 'random-access-idb';

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
  // Force IndexedDB storage so we don’t pull in chrome-file
  ssb = initSSB('cashucast-ssb', { storage: randomAccessIdb });

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
