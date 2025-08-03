/*
 * Licensed under GPL-3.0-or-later
 * history-worker module.
 */
/**
 * Retrieve IDs of timeline items seen since the given timestamp. The data is
 * read from localStorage allowing the main thread to filter out recently seen
 * posts while running inside a worker.
 *
 * @param since - Timestamp (ms) after which items are considered recent.
 */
export async function get(since: number): Promise<Set<string>> {
  try {
    const ls: any = (globalThis as any).localStorage;
    if (!ls) return new Set();
    const raw = ls.getItem('timeline-history');
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    const map = data?.state?.map ?? data?.map ?? {};
    const out = new Set<string>();
    for (const [id, v] of Object.entries<any>(map)) {
      if ((v?.ts ?? 0) >= since) out.add(id);
    }
    return out;
  } catch (_) {
    return new Set();
  }
}
