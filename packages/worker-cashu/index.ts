/*
 * Licensed under GPL-3.0-or-later
 * Entry point for the packages/worker-cashu module.
 */
/**
 * Web worker that exposes Cashu minting utilities over a simple RPC interface.
 * Methods defined here are consumed by the main application thread to mint and
 * send e-cash tokens without blocking the UI.
 */
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
  /**
   * Mint new e-cash proofs from the configured Cashu mint.
   *
   * @param sats - Amount in satoshis to mint.
   * @returns Total value of proofs obtained from the mint.
   */
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
  /**
   * Send a "zap" payment to a receiver by creating a token transfer.
   *
   * @param receiverPk - Public key of the receiver.
   * @param sats - Amount in satoshis to transfer.
   * @param refId - Reference identifier for the zap event.
   * @returns Object containing the zap details and encoded token.
   */
  sendZap: async (receiverPk: string, sats: number, refId: string) => {
    if (!wallet) throw new Error('wallet not initialized');
    const { send, keep } = await wallet.send(sats, proofs);
    proofs = keep;
    (globalThis as any).__cashuProofs = proofs;
    const token = getEncodedTokenV4({ mint: MINT_URL, proofs: send });
    return { receiverPk, sats, refId, token };
  },
  /**
   * Initialise the wallet for the worker. If a mnemonic is not provided a new
   * one will be generated and returned to the caller.
   *
   * @param mnemonic - Optional BIP39 seed phrase to load.
   * @returns The mnemonic used for the wallet.
   */
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

