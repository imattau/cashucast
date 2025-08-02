import { createRPCHandler } from '../../shared/rpc';
import { generateMnemonic } from 'bip39';

createRPCHandler(self as any, {
  mint: async (sats) => {
    // TODO: mint sats using Cashu
    return sats;
  },
  sendZap: async (receiverPk, sats, refId) => {
    // TODO: send zap
    return { receiverPk, sats, refId };
  },
  initWallet: async (mnemonic?: string) => {
    const phrase = mnemonic ?? generateMnemonic();
    return phrase;
  },
});
