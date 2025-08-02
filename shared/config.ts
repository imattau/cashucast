import { z } from 'zod';

const envSchema = z.object({
  VITE_ROOM_URL: z.string().optional(),
  VITE_TRACKER_URLS: z.string().optional(), // JSON array string
});
const env = envSchema.parse(import.meta.env);

/**
 * Returns default Room + Tracker URLs.
 * 1. If app served from https://app.cashucast.app:
 *    • room → wss://room.cashucast.app
 *    • tracker → wss://tracker.cashucast.app
 * 2. Else fall back to VITE_* values.
 */
export function getDefaultEndpoints() {
  const host = window.location.hostname;
  // pattern: subdomain.domain.tld
  const [, domain, tld] = host.split('.').slice(-3);
  const base = domain && tld ? `${domain}.${tld}` : null;

  const room =
    base ? `wss://room.${base}` : env.VITE_ROOM_URL || 'ws://localhost:4545';

  const trackerList =
    base
      ? [`wss://tracker.${base}`]
      : env.VITE_TRACKER_URLS
      ? JSON.parse(env.VITE_TRACKER_URLS)
      : ['ws://localhost:8000'];

  return { room, trackerList };
}

