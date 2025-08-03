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

