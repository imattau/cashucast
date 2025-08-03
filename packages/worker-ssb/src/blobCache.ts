/*
 * Licensed under GPL-3.0-or-later
 *
 * In-memory bookkeeping for blob data used by worker threads. Entries are
 * stored with their byte size and last-touch timestamp so we can enforce a
 * maximum cache size by pruning the oldest blobs.
 */
import LRUK from 'quick-lru'; // small, zero-dep

export type BlobMeta = { bytes: number; ts: number };
export const cache = new LRUK<string, BlobMeta>({ maxSize: 500 }); // entry-count limit

// Track byte size separately since quick-lru only limits entry count
let maxBytes = 500;

/**
 * Sets the cache's maximum allowed size.
 *
 * The limit is provided in megabytes and converted to a byte count used when
 * pruning old entries. This affects only the total byte size, not the number
 * of cache entries.
 *
 * @param {number} mb - Desired cache limit in megabytes.
 */
export function setMaxCacheMB(mb: number) {
  maxBytes = mb * 1024 * 1024;
}

/**
 * Marks a blob as recently used or adds it to the cache.
 *
 * Updates the metadata for the given hash with its size in bytes and a fresh
 * timestamp so pruning can treat it as the most recently accessed blob.
 *
 * @param {string} hash - The blob's identifier.
 * @param {number} bytes - Size of the blob in bytes.
 */
export function touch(hash: string, bytes: number) {
  cache.set(hash, { bytes, ts: Date.now() });
}

/**
 * Removes least-recently used blobs until the cache fits within the limit.
 *
 * Entries are sorted by their last-touch timestamp and deleted oldest-first
 * until the total byte count is within the configured maximum. Each removed
 * blob is also deleted from the SSB store. The total number of bytes freed is
 * returned.
 *
 * @param {any} ssb - Secure Scuttlebutt instance used to remove blobs.
 * @returns {number} Total bytes reclaimed from pruning.
 */
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
