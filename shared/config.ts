/*
 * Licensed under GPL-3.0-or-later
 * Configuration utilities.
 */
import { z } from 'zod';

const envSchema = z.object({
  VITE_ROOM_URL: z.string().optional(),
  VITE_TRACKER_URLS: z.string().optional(), // JSON array string
  VITE_DHT_URL: z.string().optional(),
});
const env = envSchema.parse((import.meta as any).env);

/**
 * Returns default Room, Tracker and DHT URLs.
 * 1. If app served from https://app.cashucast.app:
 *    • room → wss://room.cashucast.app
 *    • tracker → wss://tracker.cashucast.app
 *    • dht → wss://dht.cashucast.app
 * 2. Else fall back to VITE_* values.
 */
export function getDefaultEndpoints() {
  if (typeof window === 'undefined') {
    return {
      room: env.VITE_ROOM_URL || 'ws://localhost:4545',
      trackerList: env.VITE_TRACKER_URLS
        ? JSON.parse(env.VITE_TRACKER_URLS)
        : ['ws://localhost:8000'],
      dht: env.VITE_DHT_URL || 'ws://localhost:6881',
    };
  }

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

  const dht = base ? `wss://dht.${base}` : env.VITE_DHT_URL || 'ws://localhost:6881';

  return { room, trackerList, dht };
}

