/**
 * Background worker that periodically polls a tracker for swarm statistics and
 * relays them to the UI thread.
 */
import ky from 'kyou'; // 4 kB fetch wrapper
export type CountMap = Record<string /*infoHash*/, number>;

let cache: CountMap = {};

/**
 * Fetch the latest peer counts from a tracker and cache the results.
 *
 * @param endpoint - Base URL of the tracker API.
 */
export async function refresh(endpoint: string) {
  try {
    const json = await ky.get(`${endpoint}/stats`).json<any>();
    cache = Object.fromEntries(
      json.torrents.map((t: any) => [t.infoHash, t.peers])
    );
    postMessage({ type: 'stats:update', data: cache });
  } catch (_) { /* swallow */ }
}

setInterval(() => refresh((self as any).tracker), 60_000);
onmessage = (e) => e.data === 'get' && postMessage(cache);
