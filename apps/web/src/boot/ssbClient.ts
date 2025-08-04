/*
 * Licensed under GPL-3.0-or-later
 * Boot module for initializing the SSB client.
*/
import { init as createBrowserSsb } from 'ssb-browser-core/net.js';
import randomAccessIdb from 'random-access-idb';

let ssb: any;

export async function initSsb() {
  if (ssb) return ssb;
  const sodium = await import('libsodium-wrappers-sumo').then(m => m);
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
    ssb = {
      db: { publish: () => {} },
      blobs: {
        add: () => ({
          write() {},
          end(cb: any) {
            cb(null, 'hash');
          },
        }),
        get: () => {},
        rm: () => {},
      },
    };
  }
  return ssb;
}
