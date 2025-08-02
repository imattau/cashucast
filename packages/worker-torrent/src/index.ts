import WebTorrent from 'webtorrent';
import { createRPCHandler } from '../../shared/rpc';
import { useSettings } from '../../shared/store/settings';
import { cache, touch, prune } from '../../worker-ssb/src/blobCache';
import { getSSB } from '../../worker-ssb/src/instance';

const { trackerUrls: trackers } = useSettings.getState();
const client = new WebTorrent();

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

async function stream(magnet: string): Promise<void> {
  const infoHashMatch = magnet.match(/btih:([a-zA-Z0-9]+)/);
  const infoHash = infoHashMatch ? infoHashMatch[1] : magnet;

  // 1. Check SSB blob cache first
  const ssb = getSSB();
  ssb.blobs.get(infoHash, (err: any, blobStream: any) => {
    if (!err && blobStream) {
      const chunks: Uint8Array[] = [];
      blobStream.on('data', (ch: Uint8Array) => chunks.push(ch));
      blobStream.on('end', () => {
        const file = new Blob(chunks, { type: 'video/mp4' });
        touch(infoHash, file.size);
        postMessage({ type: 'stream_ready', url: URL.createObjectURL(file) });
      });
    } else {
      // fallback to torrent as before …
      client.add(magnet, { announce: trackers }, (torrent: any) => {
        const file = torrent.files[0];
        file.getBlob((error: any, blob: Blob) => {
          if (error) return;
          postMessage({ type: 'stream_ready', url: URL.createObjectURL(blob) });
        });
      });
    }
  });
}

createRPCHandler(self as any, {
  seedFile,
  stream,
});
