import { createRPCHandler } from '../../shared/rpc';

createRPCHandler(self as any, {
  mint: async (sats) => {
    // TODO: mint sats using Cashu
    return sats;
  },
  sendZap: async (receiverPk, sats, refId) => {
    // TODO: send zap
    return { receiverPk, sats, refId };
  },
});
