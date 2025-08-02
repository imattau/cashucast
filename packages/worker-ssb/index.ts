import { createRPCHandler } from '../../shared/rpc';

// Temporary in-memory posts so the timeline has content during tests or
// development. In a real implementation these would come from the SSB
// network. Each post contains a simple author object, some text and a
// magnet link to a short clip.
const mockPosts = [
  {
    id: '1',
    author: { name: 'Alice', pubkey: 'alicepk' },
    text: 'Hello from SSB',
    magnet: 'magnet:?xt=urn:btih:alice',
  },
  {
    id: '2',
    author: { name: 'Bob', pubkey: 'bobpk' },
    text: 'Another post on the network',
    magnet: 'magnet:?xt=urn:btih:bob',
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
