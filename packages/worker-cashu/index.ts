import { createRPCHandler } from '../../shared/rpc';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import {
  CashuMint,
  CashuWallet,
  MintQuoteState,
  getEncodedTokenV4,
  Proof,
} from '@cashu/cashu-ts';

const MINT_URL = (self as any).CASHU_MINT_URL || 'http://localhost:3333';

let wallet: CashuWallet | null = null;
let proofs: Proof[] = (globalThis as any).__cashuProofs || [];
(globalThis as any).__cashuProofs = proofs;

createRPCHandler(self as any, {
  mint: async (sats: number) => {
    if (!wallet) throw new Error('wallet not initialized');
    const quote = await wallet.createMintQuote(sats);
    const status = await wallet.checkMintQuote(quote.quote);
    if (status.state !== MintQuoteState.PAID) {
      throw new Error('invoice not paid');
    }
    const newProofs = await wallet.mintProofs(sats, quote.quote);
    proofs.push(...newProofs);
    (globalThis as any).__cashuProofs = proofs;
    return newProofs.reduce((sum, p) => sum + p.amount, 0);
  },
  sendZap: async (receiverPk: string, sats: number, refId: string) => {
    if (!wallet) throw new Error('wallet not initialized');
    const { send, keep } = await wallet.send(sats, proofs);
    proofs = keep;
    (globalThis as any).__cashuProofs = proofs;
    const token = getEncodedTokenV4({ mint: MINT_URL, proofs: send });
    return { receiverPk, sats, refId, token };
  },
  initWallet: async (mnemonic?: string) => {
    const phrase = mnemonic ?? generateMnemonic();
    const seed = mnemonicToSeedSync(phrase);
    const mint = new CashuMint(MINT_URL);
    wallet = new CashuWallet(mint, { bip39seed: seed });
    await wallet.loadMint();
    proofs = [];
    (globalThis as any).__cashuProofs = proofs;
    return phrase;
  },
});

