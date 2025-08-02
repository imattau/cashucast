import React from 'react';
import { useSettingsStore } from './settingsStore';

/** Settings screen with various toggles. */
export const Settings: React.FC = () => {
  const showNSFW = useSettingsStore((s) => s.showNSFW);
  const setShowNSFW = useSettingsStore((s) => s.setShowNSFW);

  return (
    <div className="p-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showNSFW}
          onChange={(e) => setShowNSFW(e.target.checked)}
        />
        <span>Show NSFW content</span>
      </label>
    </div>
  );
};

