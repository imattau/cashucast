import { useProfile } from '../../shared/store/profile';
import { useSettings } from '../../shared/store/settings';

export const SettingsAppearance: React.FC = () => {
  const exportProfile = useProfile((s) => s.exportProfile);
  const { lowSeedRatio, setLowSeedRatio } = useSettings((s) => ({
    lowSeedRatio: s.lowSeedRatio,
    setLowSeedRatio: s.setLowSeedRatio,
  }));

  const onExport = () => {
    const blob = exportProfile();
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashucast-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onReset = async () => {
    await useProfile.persist.clearStorage();
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Appearance</h2>
      <div className="space-x-2">
        <button
          onClick={onExport}
          className="rounded bg-primary px-3 py-2 text-white"
        >
          Export Backup
        </button>
        <button
          onClick={onReset}
          className="rounded bg-red-600 px-3 py-2 text-white"
        >
          Reset App
        </button>
      </div>
      <label className="block mt-6">
        <span className="text-sm">Low-seeder slot every {lowSeedRatio} clips</span>
        <input
          type="range"
          min={5}
          max={20}
          step={1}
          value={lowSeedRatio}
          onChange={(e) => setLowSeedRatio(Number(e.target.value))}
          className="w-full"
        />
      </label>
    </div>
  );
};



