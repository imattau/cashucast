import React from 'react';

/** Progress bar showing used storage quota. */
export const QuotaBar: React.FC = () => {
  const [{ usage, quota }, setEstimate] = React.useState({ usage: 0, quota: 0 });

  React.useEffect(() => {
    let mounted = true;
    if (navigator?.storage?.estimate) {
      navigator.storage.estimate().then((res) => {
        if (mounted) setEstimate({ usage: res.usage ?? 0, quota: res.quota ?? 0 });
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const pct = quota > 0 ? Math.min(100, (usage / quota) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-gray-200 rounded">
        <div
          className="h-2 bg-green-500 rounded"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {((usage / 1024) | 0)}KB / {((quota / 1024) | 0)}KB
      </div>
    </div>
  );
};
