import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string(),
  author: z.object({
    name: z.string(),
    pubkey: z.string(),
  }),
  /** Magnet link for the post's clip */
  magnet: z.string(),
  /** Optional text accompanying the clip */
  text: z.string().optional(),
  /** Whether the post is not safe for work */
  nsfw: z.boolean().optional(),
  /** Reports about the post from other users */
  reports: z
    .object({
      fromPk: z.string(),
      reason: z.string(),
      ts: z.number(),
    })
    .array()
    .optional(),
});

export type Post = z.infer<typeof PostSchema>;

