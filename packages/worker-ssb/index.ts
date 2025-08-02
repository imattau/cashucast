import { createRPCHandler } from '../../shared/rpc';
import type { Post } from '../../shared/types';

// Temporary in-memory posts so the timeline has content during tests or
// development. In a real implementation these would come from the SSB
// network. Each post contains a simple author object, some text and a
// magnet link to a short clip.
const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Alice', pubkey: 'alicepk' },
    text: 'Hello from SSB',
    magnet: 'magnet:?xt=urn:btih:alice',
    nsfw: false,
  },
  {
    id: '2',
    author: { name: 'Bob', pubkey: 'bobpk' },
    text: 'Another post on the network',
    magnet: 'magnet:?xt=urn:btih:bob',
    nsfw: false,
  },
];

// Temporary in-memory log for SSB-style messages such as reports or blocks.
// This simulates appending to the SSB log.
const mockLog: any[] = [];

// Very small helper around IndexedDB for persisting blocked pubkeys. This is
// extremely minimal and only suitable for tests or development.
const dbPromise = new Promise<any>((resolve, reject) => {
  const req = (self as any).indexedDB?.open('ssb', 1);
  if (!req) {
    resolve(null);
    return;
  }
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('blocks')) {
      db.createObjectStore('blocks', { keyPath: 'pubKey' });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

async function storeBlock(pubKey: string) {
  const db = await dbPromise;
  if (!db) return;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('blocks', 'readwrite');
    tx.objectStore('blocks').put({ pubKey });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlockedPubKeys(): Promise<Set<string>> {
  const db = await dbPromise;
  if (!db) return new Set();
  return await new Promise<Set<string>>((resolve, reject) => {
    const tx = db.transaction('blocks', 'readonly');
    const req = tx.objectStore('blocks').getAll();
    req.onsuccess = () => {
      resolve(new Set(req.result.map((r: any) => r.pubKey)));
    };
    req.onerror = () => reject(req.error);
  });
}

createRPCHandler(self as any, {
  publishPost: async (post: Post) => {
    // TODO: publish post to SSB
    mockPosts.push({ ...post, nsfw: post.nsfw ?? false });
    return post;
  },
  queryFeed: async (_opts) => {
    const blocked = await getBlockedPubKeys();
    const thresholdEnv =
      (self as any).SSB_REPORT_THRESHOLD ??
      (self as any).process?.env?.SSB_REPORT_THRESHOLD;
    const threshold = Number(thresholdEnv ?? 5);
    return mockPosts.filter((post) => {
      if (blocked.has(post.author.pubkey)) return false;
      const reporters = new Set(
        (post.reports ?? []).map((r) => r.fromPk)
      );
      return reporters.size < threshold;
    });
  },
  reportPost: async (postId: string, reason: string) => {
    const report = { fromPk: 'local', reason, ts: Date.now() };
    const post = mockPosts.find((p) => p.id === postId);
    if (post) {
      post.reports = [...(post.reports ?? []), report];
    }
    const msg = { type: 'report', target: postId, reason, fromPk: report.fromPk };
    mockLog.push(msg);
    return msg;
  },
  blockUser: async (pubKey: string) => {
    await storeBlock(pubKey);
    const msg = { type: 'block', target: pubKey };
    mockLog.push(msg);
    return msg;
  },
});
