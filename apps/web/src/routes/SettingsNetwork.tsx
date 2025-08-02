import { useState } from 'react';
import { useSettings } from '../../shared/store/settings';

export default function SettingsNetwork() {
  const { roomUrl, trackerUrls, setRoomUrl, addTracker, removeTracker } =
    useSettings();
  const [newTracker, setNewTracker] = useState('');

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Network</h2>

      <label className="block">
        <span className="text-sm">SSB Room URL</span>
        <input
          className="mt-1 w-full rounded border p-2"
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
        />
      </label>

      <div>
        <span className="text-sm">WebTorrent Trackers</span>
        <ul className="mt-1 space-y-1">
          {trackerUrls.map((u) => (
            <li key={u} className="flex items-center gap-2">
              <span className="flex-1 truncate">{u}</span>
              <button
                onClick={() => removeTracker(u)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded border p-2"
            placeholder="wss://tracker.example"
            value={newTracker}
            onChange={(e) => setNewTracker(e.target.value)}
          />
          <button
            onClick={() => {
              addTracker(newTracker.trim());
              setNewTracker('');
            }}
            className="rounded bg-primary px-3 py-2 text-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

