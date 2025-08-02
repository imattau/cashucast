import { createRPCHandler } from '../../shared/rpc';

createRPCHandler(self as any, {
  publishPost: async (post) => {
    // TODO: publish post to SSB
    return post;
  },
  queryFeed: async (opts) => {
    // TODO: query feed
    return opts;
  },
});
