/*
 * Licensed under GPL-3.0-or-later
 *
 * Tracks which users have boosted individual posts and exposes a small
 * subscription API so UI components can react to booster updates. Consumers can
 * subscribe to a post ID and will be notified when `setBoosters` updates the
 * underlying mapping of post IDs to boosting users. The default export renders
 * a badge displaying the current boost count.
 */
import { useSyncExternalStore } from 'react';

type Callback = () => void;

const listeners = new Map<string, Set<Callback>>();

export const boosterMap = new Map<string, string[]>();

export const subs = {
  add(id: string, cb: Callback) {
    const set = listeners.get(id) || new Set<Callback>();
    set.add(cb);
    listeners.set(id, set);
    return () => {
      set.delete(cb);
      if (!set.size) listeners.delete(id);
    };
  },
};

/**
 * Update the list of boosters for a post and notify any subscribed listeners.
 *
 * @param id - Identifier of the post whose boosters changed.
 * @param users - Public keys of users who have boosted the post.
 *
 * Side effects:
 * - Mutates {@link boosterMap} for the given `id`.
 * - Invokes all registered callbacks for that `id` so dependents can re-render.
 */
export function setBoosters(id: string, users: string[]) {
  boosterMap.set(id, users);
  const set = listeners.get(id);
  if (set) {
    for (const cb of set) cb();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', (e: MessageEvent) => {
    const data: any = e.data;
    if (data && data.type === 'boosters') {
      setBoosters(data.id, data.users || []);
    }
  });
}

/**
 * Displays a boost count badge for a post.
 *
 * The component subscribes to booster updates for the provided `id` using
 * `useSyncExternalStore`. It renders only when at least one user has boosted
 * the post and shows the number of boosters derived from {@link boosterMap}.
 */
export default function BoostBadge({ id }: { id: string }) {
  const boosters = useSyncExternalStore(
    (cb) => subs.add(id, cb),
    () => boosterMap.get(id) || [],
    () => boosterMap.get(id) || []
  );
  if (!boosters.length) return null;
  return (
    <div className="flex items-center gap-1 text-sm text-white/80">
      ↻ {boosters.length}
      {/* hover → absolute grid of avatar imgs */}
    </div>
  );
}

