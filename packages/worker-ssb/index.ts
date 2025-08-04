/*
 * Licensed under GPL-3.0-or-later
 * Entry point for the packages/worker-ssb module.
 */
/**
 * Worker handling Secure Scuttlebutt (SSB) style feed operations and full-text
 * search. Exposes an RPC API used by the application to publish and query
 * posts without blocking the main thread.
 */
import { createRPCHandler } from '../../shared/rpc';
import type { Post } from '../../shared/types';
import MiniSearch from 'minisearch';
import { get as getHistory } from '../../shared/store/history-worker';

// `ssb-browser-core` and its transitive dependencies expect Node globals such
// as `process` and `Buffer` to exist during module evaluation. When this worker
// is bundled for the browser those globals are absent and the modules throw
// `ReferenceError`s. To avoid that we polyfill the minimal pieces required
// before dynamically importing modules that rely on them.
if (!(globalThis as any).process) {
  (globalThis as any).process = {
    env: {},
    browser: true,
    // Mimic Node's nextTick using `setTimeout`.
    nextTick: (cb: (...args: any[]) => void) => setTimeout(cb, 0),
    exit: () => {},
  };
}
if (!globalThis.Buffer) {
  const { Buffer } = await import('buffer/');
  (globalThis as any).Buffer = Buffer;
}

if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
  const fakeLocation = { hostname: 'localhost' } as Location;
  Object.defineProperty(globalThis, 'location', {
    value: fakeLocation,
    configurable: false,
  });
}

// Dynamic import ensures `Buffer` is available before evaluating modules that
// depend on it (e.g. `ssb-browser-core`).
const instanceMod: any = await import('./src/instance');

async function ensureSSB() {
  const init = (instanceMod as any).initSsb as
    | (() => Promise<any>)
    | undefined;
  const get = (instanceMod as any).getSSB as (() => any) | undefined;
  return init ? await init() : get && get();
}

let storedKeys: { sk: string; pk: string } | undefined;

const toBase64 = (buf: ArrayBuffer): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64');
  }
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

// Global SSB log shared across workers to simulate replication
const ssbLog: any[] = (globalThis as any).__cashuSSBLog || [];
(globalThis as any).__cashuSSBLog = ssbLog;

// simple full-text index using MiniSearch
const mini = new MiniSearch({ fields: ['text'], storeFields: ['id'] });

// index any existing posts in the log
for (const msg of ssbLog) {
  if (msg.type === 'post') mini.add({ id: msg.id, text: msg.text || '' });
}

createRPCHandler(self as any, {
  /**
   * Generate or set the key pair used for signing SSB messages.
   *
   * @param sk - Optional secret key in base64 format to load.
   * @param pk - Optional public key in base64 format to load.
   * @returns The generated key pair when new keys are created.
   */
  initKeys: async (sk?: string, pk?: string) => {
    if (sk && pk) {
      storedKeys = { sk, pk };
      return;
    }
    let keyPair: CryptoKeyPair;
    try {
      keyPair = (await crypto.subtle.generateKey(
        { name: 'Ed25519' } as any,
        true,
        ['sign', 'verify']
      )) as CryptoKeyPair;
    } catch {
      keyPair = (await crypto.subtle.generateKey(
        { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' } as any,
        true,
        ['sign', 'verify']
      )) as CryptoKeyPair;
    }
    const skStr = toBase64(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey));
    const pkStr = toBase64(await crypto.subtle.exportKey('spki', keyPair.publicKey));
    storedKeys = { sk: skStr, pk: pkStr };
    return { sk: skStr, pk: pkStr };
  },
  /**
   * Append a post to the local log and broadcast it to connected peers.
   *
   * @param post - Post content to publish.
   * @returns The stored post with generated id and defaults.
   */
  publishPost: async (post: Omit<Post, 'ts'> & { ts?: number }) => {
    const id = post.id ?? crypto.randomUUID();
    const fullPost: Post = {
      ...post,
      id,
      nsfw: post.nsfw ?? false,
      ts: post.ts ?? Date.now(),
    };
    ssbLog.push({ type: 'post', ...fullPost });
    mini.add({ id, text: fullPost.text || '' });
    for (const r of post.reports ?? []) {
      ssbLog.push({ type: 'report', target: id, ...r });
    }
    try {
      const ssb = await ensureSSB();
      ssb.db.publish({ type: 'post', ...fullPost }, () => {});
    } catch (_) {}
    return fullPost;
  },
  /**
   * Retrieve comment texts for a particular post from the local log.
   *
   * @param postId - Identifier of the post whose comments are requested.
   * @returns Array of comment strings sorted by timestamp.
   */
  queryComments: async (postId: string) => {
    return ssbLog
      .filter((m) => m.type === 'comment' && m.postId === postId)
      .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
      .map((m) => m.text);
  },
  /**
   * Append a comment for a given post to the local log.
   *
   * @param opts - The post identifier and comment text.
   * @returns The stored comment with generated id and timestamp.
   */
  publishComment: async (opts: { postId: string; text: string }) => {
    const comment = {
      type: 'comment',
      id: crypto.randomUUID(),
      postId: opts.postId,
      text: opts.text,
      ts: Date.now(),
    };
    ssbLog.push(comment);
    try {
      const ssb = await ensureSSB();
      ssb.db.publish(comment, () => {});
    } catch (_) {}
    return comment;
  },
  /**
   * Retrieve posts from the log applying basic moderation rules and tag
   * filters. Reported posts over a threshold or posts from blocked users are
   * excluded.
   *
   * @param opts - Optional tag filters to include.
   * @returns Array of posts sorted roughly by relevance.
   */
  queryFeed: async (opts) => {
    const includeTags = opts?.includeTags ?? [];
    const thresholdEnv =
      (self as any).SSB_REPORT_THRESHOLD ??
      (self as any).process?.env?.SSB_REPORT_THRESHOLD;
    const threshold = Number(thresholdEnv ?? 5);

    const blocked = new Set(
      ssbLog.filter((m) => m.type === 'block').map((m) => m.target)
    );
    const reportsMap = new Map<string, Set<string>>();
    const boostsMap = new Map<string, any[]>();
    for (const msg of ssbLog) {
      if (msg.type === 'report') {
        const set = reportsMap.get(msg.target) || new Set();
        set.add(msg.fromPk);
        reportsMap.set(msg.target, set);
      } else if (msg.type === 'repost') {
        const arr = boostsMap.get(msg.link) || [];
        arr.push(msg.author);
        boostsMap.set(msg.link, arr);
      }
    }

    const posts = ssbLog.filter((m) => m.type === 'post');
    const filtered = posts.filter((post: any) => {
      if (blocked.has(post.author.pubkey)) return false;
      if (includeTags.length > 0) {
        const postTags = post.tags ?? [];
        if (!includeTags.every((t) => postTags.includes(t))) return false;
      }
      const reporters = reportsMap.get(post.id) || new Set();
      return reporters.size < threshold;
    });

    const recentCutoff = Date.now() - 1000 * 60 * 60 * 48; // 48 h
    const recentlySeen = await getHistory(recentCutoff); // returns Set<msgId>
    const unseen = filtered.filter((p: any) => !recentlySeen.has(p.id));

    const attachBoosters = (arr: any[]) =>
      arr.map((p) => ({ ...p, boosters: boostsMap.get(p.id) || [] }));

    const statsWorker = (globalThis as any).statsWorker;
    if (statsWorker && statsWorker.postMessage) {
      try {
        const counts: Record<string, number> = await new Promise((res) => {
          const ch = (e: any) => {
            statsWorker.removeEventListener('message', ch);
            res(e.data);
          };
          statsWorker.addEventListener('message', ch, { once: true });
          statsWorker.postMessage('get');
        });

        const high: any[] = [];
        const low: any[] = [];
        for (const p of unseen) {
          (counts[p.magnet?.slice(20, 60)] ?? 0) >= 3 ? high.push(p) : low.push(p);
        }

        const final: any[] = [];
        let i = 0;
        let j = 0;
        while (i < high.length || j < low.length) {
          for (let k = 0; k < 9 && i < high.length; k++) final.push(high[i++]);
          if (j < low.length) final.push(low[j++]);
        }
        return attachBoosters(final);
      } catch (_) {
        /* ignore */
      }
    }

    return attachBoosters(unseen);
  },
  /**
   * Compute the most frequently used tags within a recent time window.
   *
   * @param opts - Optional parameters controlling date range and number of
   * results.
   * @returns A list of tags with their occurrence counts.
   */
  topTags: async (opts) => {
    const since = opts?.since ?? Date.now() - 48 * 60 * 60 * 1000;
    const limit = opts?.limit ?? 20;
    const posts = ssbLog.filter(
      (m) => m.type === 'post' && (m.ts ?? 0) >= since
    );
    const counts: Record<string, number> = {};
    for (const p of posts) {
      for (const t of p.tags ?? []) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  },
  /**
   * Perform a full-text search over the indexed posts.
   *
   * @param query - Search term to match against post text.
   * @param limit - Maximum number of results to return.
   * @returns Array of posts matching the query.
   */
  searchPosts: async (query: string, limit = 20) => {
    const results = mini.search(query, { prefix: true }).slice(0, limit);
    const posts = new Map(
      ssbLog.filter((m) => m.type === 'post').map((p: any) => [p.id, p])
    );
    return results.map((r) => posts.get(r.id)).filter(Boolean);
  },
  /**
   * Record a report for a post which will influence moderation filtering.
   *
   * @param postId - Identifier of the post being reported.
   * @param reason - Free-form reason describing the issue.
   * @returns The report message stored in the log.
   */
  reportPost: async (postId: string, reason: string) => {
    const report = { fromPk: 'local', reason, ts: Date.now() };
    const msg = { type: 'report', target: postId, ...report };
    ssbLog.push(msg);
    try {
      const ssb = await ensureSSB();
      ssb.db.publish(msg, () => {});
    } catch (_) {}
    return msg;
  },
  /**
   * Block posts from a particular user by their public key.
   *
   * @param pubKey - Public key identifying the user to block.
   * @returns The block message stored in the log.
   */
  blockUser: async (pubKey: string) => {
    const msg = { type: 'block', target: pubKey, ts: Date.now() };
    ssbLog.push(msg);
    try {
      const ssb = await ensureSSB();
      ssb.db.publish(msg, () => {});
    } catch (_) {}
    return msg;
  },
  /**
   * Append an arbitrary message to the log, primarily for testing purposes.
   *
   * @param msg - SSB message object to store.
   * @returns The stored message.
   */
  publish: async (msg: any) => {
    ssbLog.push(msg);
    try {
      const ssb = await ensureSSB();
      ssb.db.publish(msg, () => {});
    } catch (_) {}
    return msg;
  },
});
