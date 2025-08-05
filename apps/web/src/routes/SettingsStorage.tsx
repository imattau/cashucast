/*
 * Licensed under GPL-3.0-or-later
 * React component for SettingsStorage.
 */
import React from 'react';
import { useSettings } from '../../shared/store/settings';
import { createRPCClient } from '../../shared/rpc';

export const SettingsStorage: React.FC = () => {
  const { maxBlobMB, setMaxBlobMB } = useSettings();
  const rpcRef = React.useRef<ReturnType<typeof createRPCClient> | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' },
    );
    rpcRef.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Storage</h2>

      <label htmlFor="max-cache" className="block text-sm">
        Max offline video cache (MB): {maxBlobMB}
      </label>
      <input
        id="max-cache"
        name="maxCacheMB"
        type="range"
        min={128}
        max={2048}
        step={128}
        value={maxBlobMB}
        onChange={(e) => {
          const mb = Number(e.target.value);
          setMaxBlobMB(mb);
          rpcRef.current?.('setMaxCacheMB', mb);
        }}
        className="w-full"
      />
    </div>
  );
};

