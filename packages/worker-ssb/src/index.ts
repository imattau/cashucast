import sodium from 'libsodium-wrappers-sumo';
import { init as createBrowserSsb } from 'ssb-browser-core/net.js';
import randomAccessIdb from 'random-access-idb';

let ssb: any;

export async function initSsb() {
  if (ssb) return ssb;
  await sodium.ready;
  try {
    ssb = createBrowserSsb('cashucast-ssb', {
      storage: randomAccessIdb,
      crypto: {
        sign: sodium.crypto_sign_detached,
        verify: sodium.crypto_sign_open_detached,
        secretbox: sodium.crypto_secretbox_easy,
        openSecretbox: sodium.crypto_secretbox_open_easy,
      },
    });
  } catch (err) {
    // Fallback stub for environments without IndexedDB
    ssb = {
      db: { publish: () => {} },
      blobs: {
        add: () => ({ write() {}, end(cb: any) { cb(null, 'hash'); } }),
        get: () => {},
        rm: () => {},
      },
    };
  }
  return ssb;
}

export function getSSB() {
  if (!ssb) {
    throw new Error('SSB instance not initialized. Call initSsb() first.');
  }
  return ssb;
}

export { ssb };
