import { createRPCHandler } from '../../shared/rpc';

// Temporary in-memory posts so the timeline has content during tests or
// development. In a real implementation these would come from the SSB
// network. Each post contains a simple author object and some text.
const mockPosts = [
  {
    id: '1',
    author: { name: 'Alice', pubkey: 'alicepk' },
    text: 'Hello from SSB',
  },
  {
    id: '2',
    author: { name: 'Bob', pubkey: 'bobpk' },
    text: 'Another post on the network',
  },
];

createRPCHandler(self as any, {
  publishPost: async (post) => {
    // TODO: publish post to SSB
    mockPosts.push(post as any);
    return post;
  },
  queryFeed: async (_opts) => {
    // TODO: query feed
    return mockPosts;
  },
});
