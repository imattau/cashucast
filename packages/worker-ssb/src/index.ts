import * as sodium from 'libsodium-wrappers-sumo';
import ssbFriends from 'ssb-friends';
import ssbSearch2 from 'ssb-search2';
import { cache as blobCache, prune } from './blobCache';

const ssbPlugins: any[] = (globalThis as any).ssbPlugins || ((globalThis as any).ssbPlugins = []);
ssbPlugins.push(ssbFriends, ssbSearch2);

let ssb: any;

function createStubSsb() {
  return {
    db: { publish: () => {} },
    blobs: {
      add: () => ({ write() {}, end(cb: any) { cb(null, 'hash'); } }),
      get: () => {},
      rm: () => {},
    },
  };
}

export async function initSsb() {
  if (ssb) return ssb;
  try {
    await sodium.ready;
  } catch (err) {
    console.error('Failed to initialize libsodium. SSB features are disabled.', err);
    ssb = createStubSsb();
    return ssb;
  }
  const { init: createBrowserSsb } = await import('ssb-browser-core/net.js');
  const randomAccessIdb = (await import('random-access-idb')).default;
  const ssbBlobStore = (await import('ssb-blob-store')).default;
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
      caps: { shs: Buffer.from(process.env.SSB_APP_KEY!, 'base64') },
    });
  } catch (err) {
    // Fallback stub for environments without IndexedDB
    ssb = createStubSsb();
  }

  if (ssb?.search2?.start) {
    await ssb.search2.start();
  }

  if (ssb?.on && ssb.ebt?.request) {
    ssb.on('rpc:connect', (peer: any) => {
      ssb.ebt.request(peer.id, true);
    });
  }

  if (ssb?.blobs?.on) {
    ssb.blobs.on('download', (hash: string, bytes: number) => {
      blobCache.set(hash, { bytes, ts: Date.now() });
      prune(ssb);
    });
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
