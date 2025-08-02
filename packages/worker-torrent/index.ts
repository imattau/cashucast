import { createRPCHandler } from '../../shared/rpc';
import { useSettings } from '../../shared/store/settings';

const { trackerUrls: trackers } = useSettings.getState();

createRPCHandler(self as any, {
  seedFile: async (file) => {
    // TODO: seed file via WebTorrent
    return file;
  },
  stream: async (magnet) => {
    // TODO: stream magnet link
    return magnet;
  },
});
