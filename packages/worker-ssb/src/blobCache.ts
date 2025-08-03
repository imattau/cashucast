/*
 * Licensed under GPL-3.0-or-later
 * blobCache module.
 */
import LRUK from 'quick-lru'; // small, zero-dep

export type BlobMeta = { bytes: number; ts: number };
export const cache = new LRUK<string, BlobMeta>({ maxSize: 500 }); // entry-count limit

// Track byte size separately since quick-lru only limits entry count
let maxBytes = 500;

export function setMaxCacheMB(mb: number) {
  maxBytes = mb * 1024 * 1024;
}

export function touch(hash: string, bytes: number) {
  cache.set(hash, { bytes, ts: Date.now() });
}

export function prune(ssb: any) {
  let freed = 0;
  let total = 0;
  for (const meta of cache.values()) total += meta.bytes;
  for (const [hash, meta] of [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)) {
    if (total <= maxBytes) break;
    ssb.blobs.rm(hash, () => {});
    cache.delete(hash);
    freed += meta.bytes;
    total -= meta.bytes;
  }
  return freed;
}
