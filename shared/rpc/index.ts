import { z } from 'zod';
import { randomUUID } from 'node:crypto';

// Placeholder schemas for complex types
const Post = z.any();
const QueryOpts = z.any();
const FileSchema = z.any();
const Magnet = z.any();

export const MethodDefinitions = {
  publishPost: z.tuple([Post]),
  queryFeed: z.tuple([QueryOpts]),
  seedFile: z.tuple([FileSchema]),
  stream: z.tuple([Magnet]),
  mint: z.tuple([z.number()]),
  sendZap: z.tuple([z.string(), z.number(), z.string()]),
} as const;

export const MethodsSchema = z.union([
  z.object({ ns: z.literal('ssb'), fn: z.literal('publishPost'), args: MethodDefinitions.publishPost }),
  z.object({ ns: z.literal('ssb'), fn: z.literal('queryFeed'), args: MethodDefinitions.queryFeed }),
  z.object({ ns: z.literal('torrent'), fn: z.literal('seedFile'), args: MethodDefinitions.seedFile }),
  z.object({ ns: z.literal('torrent'), fn: z.literal('stream'), args: MethodDefinitions.stream }),
  z.object({ ns: z.literal('cashu'), fn: z.literal('mint'), args: MethodDefinitions.mint }),
  z.object({ ns: z.literal('cashu'), fn: z.literal('sendZap'), args: MethodDefinitions.sendZap }),
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

const methodArgSchemas: Record<MethodName, z.ZodTuple<any, any>> = {
  publishPost: MethodDefinitions.publishPost,
  queryFeed: MethodDefinitions.queryFeed,
  seedFile: MethodDefinitions.seedFile,
  stream: MethodDefinitions.stream,
  mint: MethodDefinitions.mint,
  sendZap: MethodDefinitions.sendZap,
};

export function createRPCClient(port: RPCPort) {
  return function call<T extends MethodName>(method: T, ...params: MethodArgs<T>): Promise<unknown> {
    methodArgSchemas[method].parse(params);
    const id = randomUUID();
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
