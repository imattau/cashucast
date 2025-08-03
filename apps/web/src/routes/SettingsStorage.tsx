import { useSettings } from '../../shared/store/settings';
import { setMaxCacheMB } from '../../../packages/worker-ssb/src/blobCache';

export const SettingsStorage: React.FC = () => {
  const { maxBlobMB, setMaxBlobMB } = useSettings();
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Storage</h2>

      <label className="block">
        <span className="text-sm">Max offline video cache (MB): {maxBlobMB}</span>
        <input
          type="range"
          min={128}
          max={2048}
          step={128}
          value={maxBlobMB}
          onChange={(e) => {
            const mb = Number(e.target.value);
            setMaxBlobMB(mb);
            setMaxCacheMB(mb);      // tell blobCache helper
          }}
          className="w-full"
        />
      </label>
    </div>
  );
};

