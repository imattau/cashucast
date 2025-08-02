import { createRPCHandler } from '../../shared/rpc';
import type { Post } from '../../shared/types';

// Temporary in-memory posts so the timeline has content during tests or
// development. In a real implementation these would come from the SSB
// network. Each post contains a simple author object, some text and a
// magnet link to a short clip.
const mockPosts: Post[] = [
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
  publishPost: async (post: Post) => {
    // TODO: publish post to SSB
    mockPosts.push(post);
    return post;
  },
  queryFeed: async (_opts) => {
    // TODO: query feed
    return mockPosts;
  },
});
