import LRUK from 'quick-lru';     // small, zero-dep

export type BlobMeta = { bytes: number; ts: number };
export const cache = new LRUK<string, BlobMeta>({ maxSize: 500 }); // placeholder, resized at runtime

export function setMaxCacheMB(mb: number) {
  const bytes = mb * 1024 * 1024;
  cache.maxSize = bytes;
}

export function touch(hash: string, bytes: number) {
  cache.set(hash, { bytes, ts: Date.now() });
}

export function prune(ssb: any) {
  let freed = 0;
  for (const [hash, meta] of [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)) {
    if (cache.calculatedSize <= cache.maxSize) break;
    ssb.blobs.rm(hash, () => {});
    cache.delete(hash);
    freed += meta.bytes;
  }
  return freed;
}
