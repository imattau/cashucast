/*
 * Licensed under GPL-3.0-or-later
 * Boot module for initializing the SSB client.
*/
import { init as createBrowserSsb } from 'ssb-browser-core/net.js';
import randomAccessIdb from 'random-access-idb';
import ssbBlobStore from 'ssb-blob-store';
import { Buffer } from 'buffer';
import 'libsodium-sumo';
import sodium from 'libsodium-wrappers-sumo';
import { cache as blobCache, prune } from '../../../../packages/worker-ssb/src/blobCache';

let ssb: any;

export async function initSsb() {
  if (ssb) return ssb;
  await sodium.ready;
  try {
    ssb = createBrowserSsb('cashucast-ssb', {
      storage: randomAccessIdb,
      blobs: ssbBlobStore({
        storage: randomAccessIdb,
      }),
      connections: {
        incoming: {
          tunnel: [
            {
              scope: 'public',
              transform: 'shs',
              portal: 'wss://room.cashucast.app',
            },
          ],
        },
        outgoing: {
          tunnel: [{ transform: 'shs' }],
        },
      },
      friends: { hops: 2 },
      replication: { legacy: false },
      caps: { shs: Buffer.from('<YOUR_APP_KEY>', 'base64') },
    });
    if (typeof ssb.on === 'function') {
      ssb.on('rpc:connect', (peer: any) => {
        if (ssb.ebt && typeof ssb.ebt.request === 'function') {
          ssb.ebt.request(peer.id, true);
        }
      });

      if (ssb.blobs && typeof ssb.blobs.on === 'function') {
        ssb.blobs.on('download', (hash: string, bytes: number) => {
          blobCache.set(hash, { bytes, ts: Date.now() });
          prune(ssb);
        });
      }
    }
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
