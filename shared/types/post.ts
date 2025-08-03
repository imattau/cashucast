import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string(),
  author: z.object({
    name: z.string(),
    pubkey: z.string(),
    avatarUrl: z.string(),
  }),
  /** Magnet link for the post's clip */
  magnet: z.string(),
  /** Optional text accompanying the clip */
  text: z.string().optional(),
  /** Whether the post is not safe for work */
  nsfw: z.boolean().optional(),
  /** Tags associated with the post */
  tags: z.string().array().max(10).optional(),
  /** Reports about the post from other users */
  reports: z
    .object({
      fromPk: z.string(),
      reason: z.string(),
      ts: z.number(),
    })
    .array()
    .optional(),
  /** Users who reposted this post */
  boosters: z
    .object({
      name: z.string(),
      pubkey: z.string(),
      avatarUrl: z.string(),
    })
    .array()
    .optional(),
});

export interface Post {
  id: string;
  author: {
    name: string;
    pubkey: string;
    avatarUrl: string;
  };
  magnet: string;
  text?: string;
  thumbnail?: string; // blob-hash in ssb-blobs
  tags?: string[]; // ≤ 10, lower-case, no spaces
  nsfw?: boolean;
  ts: number;
  reports?: { fromPk: string; reason: string; ts: number }[];
  boosters?: { name: string; pubkey: string; avatarUrl: string }[];
}

