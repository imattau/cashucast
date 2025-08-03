/*
 * Licensed under GPL-3.0-or-later
 * Entry point for the shared/rpc module.
 */
/**
 * Minimal type-safe RPC utilities used for communication between the main
 * thread and web workers. Each method is described by a zod schema ensuring
 * that calls across the boundary are validated.
 */
import { z } from 'zod';
import { PostSchema, ProfileSchema } from '../types';

// Placeholder schemas for complex types
const QueryOpts = z.object({ includeTags: z.array(z.string()).optional() });
const TopTagsOpts = z.object({
  since: z.number().optional(),
  limit: z.number().optional(),
});
const FileSchema = z.any();
const Magnet = z.any();

const InitKeysSchema = z
  .tuple([])
  .rest(z.string().optional())
  .refine((args) => args.length <= 2, {
    message: 'Expected at most 2 arguments',
  });
const InitWalletSchema = z
  .tuple([])
  .rest(z.string().optional())
  .refine((args) => args.length <= 1, {
    message: 'Expected at most 1 argument',
  });

export const MethodDefinitions = {
  publishPost: z.tuple([PostSchema]),
  queryFeed: z.tuple([QueryOpts]),
  reportPost: z.tuple([z.string(), z.string()]),
  blockUser: z.tuple([z.string()]),
  publish: z.tuple([z.any()]),
  searchPosts: z.tuple([z.string(), z.number().optional()]),
  topTags: z.tuple([TopTagsOpts]),
  seedFile: z.tuple([FileSchema]),
  stream: z.tuple([Magnet]),
  mint: z.tuple([z.number()]),
  sendZap: z.tuple([z.string(), z.number(), z.string()]),
  initKeys: InitKeysSchema,
  initWallet: InitWalletSchema,
  // allow 0, 1, or 2 files (we’ll guard in UI)
  importProfile: z.tuple([z.array(ProfileSchema).min(0).max(2)]),
} as const;

export const MethodsSchema = z.union([
  z.object({ ns: z.literal('ssb'), fn: z.literal('publishPost'), args: MethodDefinitions.publishPost }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('queryFeed'), args: MethodDefinitions.queryFeed }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('reportPost'), args: MethodDefinitions.reportPost }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('blockUser'), args: MethodDefinitions.blockUser }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('publish'), args: MethodDefinitions.publish }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('searchPosts'), args: MethodDefinitions.searchPosts }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('topTags'), args: MethodDefinitions.topTags }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('initKeys'), args: MethodDefinitions.initKeys }),
  z.object({ ns: z.literal('torrent'), fn: z.literal('seedFile'), args: MethodDefinitions.seedFile }),
  z.object({ ns: z.literal('torrent'), fn: z.literal('stream'), args: MethodDefinitions.stream }),
  z.object({ ns: z.literal('cashu'), fn: z.literal('mint'), args: MethodDefinitions.mint }),
  z.object({ ns: z.literal('cashu'), fn: z.literal('sendZap'), args: MethodDefinitions.sendZap }),
  z.object({ ns: z.literal('cashu'), fn: z.literal('initWallet'), args: MethodDefinitions.initWallet }),
  z.object({ ns: z.literal('profile'), fn: z.literal('importProfile'), args: MethodDefinitions.importProfile }),
]);

export type Methods = z.infer<typeof MethodsSchema>;
export type MethodName = Methods['fn'];
export type MethodArgs<N extends MethodName> = Extract<Methods, { fn: N }>['args'];

export interface RPC<T extends MethodName> {
  id: string;
  method: T;
  params: MethodArgs<T>;
}

type RPCPort = {
  postMessage: (msg: unknown) => void;
  addEventListener: (type: 'message', listener: (ev: MessageEvent) => void) => void;
  removeEventListener: (type: 'message', listener: (ev: MessageEvent) => void) => void;
  start?: () => void;
};

const methodArgSchemas: Record<MethodName, z.ZodTypeAny> = {
  publishPost: MethodDefinitions.publishPost,
  queryFeed: MethodDefinitions.queryFeed,
  reportPost: MethodDefinitions.reportPost,
  blockUser: MethodDefinitions.blockUser,
  publish: MethodDefinitions.publish,
  searchPosts: MethodDefinitions.searchPosts,
  topTags: MethodDefinitions.topTags,
  seedFile: MethodDefinitions.seedFile,
  stream: MethodDefinitions.stream,
  mint: MethodDefinitions.mint,
  sendZap: MethodDefinitions.sendZap,
  initKeys: MethodDefinitions.initKeys,
  initWallet: MethodDefinitions.initWallet,
  importProfile: MethodDefinitions.importProfile,
};

/**
 * Create a function that sends RPC requests over the given message port.
 * Parameters are validated against the schema for the selected method and a
 * promise resolving with the handler's result is returned.
 *
 * @param port - MessagePort or worker used for sending messages.
 */
export function createRPCClient(port: RPCPort) {
  return function call<T extends MethodName>(method: T, ...params: MethodArgs<T>): Promise<unknown> {
    methodArgSchemas[method].parse(params);
    const id = (globalThis.crypto as Crypto).randomUUID();
    return new Promise((resolve) => {
      const listener = (ev: MessageEvent) => {
        const data = ev.data;
        if (data && data.id === id) {
          port.removeEventListener('message', listener);
          resolve(data.result);
        }
      };
      port.addEventListener('message', listener);
      port.start?.();
      port.postMessage({ id, method, params } satisfies RPC<T>);
    });
  };
}

/**
 * Register handlers for RPC requests coming in over the given port. Incoming
 * messages are validated and dispatched to the corresponding handler.
 *
 * @param port - Message port to listen on.
 * @param handlers - Mapping of method names to handler implementations.
 */
export function createRPCHandler(
  port: RPCPort,
  handlers: { [K in MethodName]?: (...args: MethodArgs<K>) => unknown | Promise<unknown> }
) {
  port.addEventListener('message', async (ev: MessageEvent) => {
    const data = ev.data;
    const parse = z
      .object({
        id: z.string(),
        method: z.enum(Object.keys(methodArgSchemas) as [MethodName, ...MethodName[]]),
        params: z.any(),
      })
      .safeParse(data);
    if (!parse.success) return;
    const { id, method, params } = parse.data;
    const args = methodArgSchemas[method].parse(params) as MethodArgs<typeof method>;
    const handler = handlers[method];
    const result = handler ? await handler(...args) : undefined;
    port.postMessage({ id, result });
  });
  port.start?.();
}
