import WebTorrent from 'webtorrent';
import { createRequire } from 'module';
import { useSettings } from '../../shared/store/settings';
import { createRPCHandler } from '../../shared/rpc';
import { cache, touch, prune } from '../../worker-ssb/src/blobCache';
import { getSSB } from '../../worker-ssb/src/instance';

const require = createRequire(import.meta.url);
let wrtc: any;
let DHT: any;
try {
  DHT = require('bittorrent-dht');
  // wrtc shim needed for DHT in browser worker
  // @ts-ignore
  wrtc = require('wrtc');
} catch {
  // optional deps may be absent in test environment
}

const { trackerUrls: trackers, rtcConfig } = useSettings.getState();
const client = new WebTorrent({ tracker: { rtcConfig } });

// ── DHT bridge  ─────────────────────────────────────────────
const { enableDht, roomUrl } = useSettings.getState();
let dht: any;
if (enableDht && DHT) {
  dht = new DHT({ wrtc, bootstrap: [`wss://dht.${new URL(roomUrl).hostname}`] });
  const timeout = setTimeout(() => {
    postMessage({ type: 'dht_unreachable' });
    dht.destroy();
  }, 5000);
  dht.on('ready', () => clearTimeout(timeout));
  dht.listen(20000);
  client.on('torrent', (t) => dht.announce(t.infoHash, 20000));
}

function seedFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    client.seed(file as any, { announce: trackers }, (torrent: any) => {
      // Pipe to SSB blob store as well
      const ssb = getSSB();
      const blobAdd = ssb.blobs.add();
      blobAdd.write(file);
      blobAdd.end((err: any, hash: string) => {
        if (!err) {
          touch(hash, file.size);
          prune(ssb);
        }
      });
      resolve(torrent.magnetURI);
    });
  });
}

async function stream(magnet: string): Promise<string> {
  const infoHashMatch = magnet.match(/btih:([a-zA-Z0-9]+)/);
  const infoHash = infoHashMatch ? infoHashMatch[1] : magnet;

  const ssb = getSSB();

  return new Promise((resolve) => {
    ssb.blobs.get(infoHash, (err: any, blobStream: any) => {
      if (!err && blobStream) {
        const chunks: Uint8Array[] = [];
        blobStream.on('data', (ch: Uint8Array) => chunks.push(ch));
        blobStream.on('end', () => {
          const file = new Blob(chunks, { type: 'video/mp4' });
          touch(infoHash, file.size);
          resolve(URL.createObjectURL(file));
        });
        blobStream.on('error', () => resolve(''));
      } else {
        client.add(magnet, { announce: trackers, dht: !!dht }, (torrent: any) => {
          const file = torrent.files[0];
          file.getBlob(async (error: any, blob: Blob) => {
            if (error) return resolve('');
            // cache in SSB for future requests
            const writer = ssb.blobs.add();
            writer.write(new Uint8Array(await blob.arrayBuffer()));
            writer.end((_: any, hash: string) => {
              touch(hash, blob.size);
              prune(ssb);
            });
            resolve(URL.createObjectURL(blob));
          });
        });
      }
    });
  });
}

createRPCHandler(self as any, {
  seedFile,
  stream,
});
