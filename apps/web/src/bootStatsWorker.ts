import { useSettings } from '../shared/store/settings';
export const statsWorker = (() => {
  const w = new Worker(new URL('../../packages/stats-worker/index.ts', import.meta.url), { type:'module' });
  w.postMessage({ tracker: useSettings.getState().trackerUrls[0] });
  return w;
})();
