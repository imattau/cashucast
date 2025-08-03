/*
 * Licensed under GPL-3.0-or-later
 *
 * Exposes a singleton `ssb-browser-core` instance used by worker threads.
 * The instance is cached on `globalThis` so subsequent calls reuse the
 * existing connection rather than creating a new one.
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

/**
 * Returns the shared Secure Scuttlebutt instance, initializing it on demand.
 *
 * A new instance is created only if one does not already exist, in which case
 * it is cached on `globalThis.__cashuSSB` and configured to use IndexedDB
 * storage. If a room URL is set in settings, the instance will attempt to
 * remember and connect to that room. This may start network activity and
 * mutates global state.
 *
 * @returns {any} The singleton SSB client.
 */
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
