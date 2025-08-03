/*
 * Licensed under GPL-3.0-or-later
 * Entry point for the packages/worker-torrent/src module.
 */
/**
 * Worker responsible for torrent seeding and playback. Files are seeded using
 * WebTorrent and mirrored into the SSB blob store to support peer-to-peer
 * retrieval across sessions.
 */
import WebTorrent from 'webtorrent';
import { useSettings } from '../../shared/store/settings';
import { createRPCHandler } from '../../shared/rpc';
import { cache, touch, prune } from '../../worker-ssb/src/blobCache';
import { getSSB } from '../../worker-ssb/src/instance';
import { getDefaultEndpoints } from '../../shared/config';

const { trackerUrls: trackers } = useSettings.getState();
const client = new WebTorrent();

// ── DHT bridge  ─────────────────────────────────────────────
const { enableDht } = useSettings.getState();
const { dht: dhtUrl } = getDefaultEndpoints();
let dht: any;
if (enableDht) {
  (async () => {
    try {
      const dhtModule = await import('bittorrent-dht');
      const DHT = dhtModule.default || dhtModule;
      const wrtcModule = await import('wrtc');
      const wrtc = wrtcModule.default || wrtcModule;
      dht = new DHT({ wrtc, bootstrap: [dhtUrl] });
      const timeout = setTimeout(() => {
        postMessage({ type: 'dht_unreachable' });
        dht.destroy();
      }, 5000);
      dht.on('ready', () => clearTimeout(timeout));
      dht.listen(20000);
      client.on('torrent', (t: any) => dht.announce(t.infoHash, 20000));
    } catch {
      // optional deps may be absent in test environment
    }
  })();
}

/**
 * Seed a file via WebTorrent and cache it in the SSB blob store for future
 * retrieval.
 *
 * @param file - Browser File object to seed.
 * @returns Magnet URI representing the seeded torrent.
 */
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

/**
 * Stream a torrent identified by a magnet URI or info hash. Attempts to read
 * from the SSB blob cache first and falls back to fetching via WebTorrent.
 *
 * @param magnet - Magnet URI or raw info hash of the torrent to fetch.
 * @returns A browser object URL for the media or an empty string on failure.
 */
async function stream(magnet: string): Promise<string> {
  const infoHashMatch = magnet.match(/btih:([a-zA-Z0-9]+)/);
  const infoHash = infoHashMatch ? infoHashMatch[1] : magnet;

  const ssb = getSSB();

  return new Promise((resolve) => {
    ssb.blobs.get(infoHash, (err: any, blobStream: any) => {
      if (!err && blobStream) {
        const chunks: BlobPart[] = [];
        blobStream.on('data', (ch: Uint8Array) => chunks.push(new Uint8Array(ch)));
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
