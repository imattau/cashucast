import { createRPCHandler } from '../../shared/rpc';
import type { Post } from '../../shared/types';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { getSSB } from './src/instance';
import MiniSearch from 'minisearch';

let storedKeys: { sk: string; pk: string } | undefined;

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
  initKeys: async (sk?: string, pk?: string) => {
    if (sk && pk) {
      storedKeys = { sk, pk };
      return;
    }
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const skStr = privateKey
      .export({ type: 'pkcs8', format: 'der' })
      .toString('base64');
    const pkStr = publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('base64');
    storedKeys = { sk: skStr, pk: pkStr };
    return { sk: skStr, pk: pkStr };
  },
  publishPost: async (post: Post) => {
    const id = post.id ?? randomUUID();
    const fullPost = {
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
      const ssb = getSSB();
      ssb.db.publish({ type: 'post', ...fullPost }, () => {});
    } catch (_) {}
    return fullPost;
  },
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
    for (const msg of ssbLog) {
      if (msg.type === 'report') {
        const set = reportsMap.get(msg.target) || new Set();
        set.add(msg.fromPk);
        reportsMap.set(msg.target, set);
      }
    }

    const posts = ssbLog.filter((m) => m.type === 'post');
    return posts.filter((post: any) => {
      if (blocked.has(post.author.pubkey)) return false;
      if (includeTags.length > 0) {
        const postTags = post.tags ?? [];
        if (!includeTags.every((t) => postTags.includes(t))) return false;
      }
      const reporters = reportsMap.get(post.id) || new Set();
      return reporters.size < threshold;
    });
  },
  searchPosts: async (query: string, limit = 20) => {
    const results = mini.search(query, { prefix: true }).slice(0, limit);
    const posts = new Map(
      ssbLog.filter((m) => m.type === 'post').map((p: any) => [p.id, p])
    );
    return results.map((r) => posts.get(r.id)).filter(Boolean);
  },
  reportPost: async (postId: string, reason: string) => {
    const report = { fromPk: 'local', reason, ts: Date.now() };
    const msg = { type: 'report', target: postId, ...report };
    ssbLog.push(msg);
    try {
      const ssb = getSSB();
      ssb.db.publish(msg, () => {});
    } catch (_) {}
    return msg;
  },
  blockUser: async (pubKey: string) => {
    const msg = { type: 'block', target: pubKey, ts: Date.now() };
    ssbLog.push(msg);
    try {
      const ssb = getSSB();
      ssb.db.publish(msg, () => {});
    } catch (_) {}
    return msg;
  },
});
