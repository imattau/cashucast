/*
 * Licensed under GPL-3.0-or-later
 * profile module.
 */
import { z } from 'zod';

const crypto = globalThis.crypto;

const SALT = 'cashucast';
const ITERATIONS = 100_000;
const KEYLEN = 32; // bytes
const DIGEST = 'SHA-256';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const base64ToBytes = (b64: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const deriveKey = async (username: string): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(username),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    { name: 'AES-CTR', length: KEYLEN * 8 },
    false,
    ['encrypt', 'decrypt'],
  );
};

const encrypt = async (value: string, username: string): Promise<string> => {
  const key = await deriveKey(username);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CTR', counter: iv, length: 128 },
    key,
    encoder.encode(value),
  );
  const payload = new Uint8Array(iv.length + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), iv.length);
  return bytesToBase64(payload);
};

const decrypt = async (payload: string, username: string): Promise<string> => {
  const key = await deriveKey(username);
  const buf = base64ToBytes(payload);
  const iv = buf.slice(0, 16);
  const data = buf.slice(16);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: iv, length: 128 },
    key,
    data,
  );
  return decoder.decode(decrypted);
};

export interface Profile {
  ssbPk: string;
  ssbSk: string; // encrypted with pbkdf2(username)
  cashuMnemonic: string; // encrypted with pbkdf2(username)
  username: string;
  avatarBlob?: string;
}

export const ProfileSchema = z.object({
  ssbPk: z.string(),
  ssbSk: z.string(),
  cashuMnemonic: z.string(),
  username: z.string(),
  avatarBlob: z.string().optional(),
});

export const createProfile = async (data: {
  ssbPk: string;
  ssbSk: string;
  cashuMnemonic: string;
  username: string;
  avatarBlob?: string;
}): Promise<Profile> => ({
  ssbPk: data.ssbPk,
  ssbSk: await encrypt(data.ssbSk, data.username),
  cashuMnemonic: await encrypt(data.cashuMnemonic, data.username),
  username: data.username,
  avatarBlob: data.avatarBlob,
});

export const decryptProfileSecrets = async (
  profile: Profile,
): Promise<{ ssbSk: string; cashuMnemonic: string }> => ({
  ssbSk: await decrypt(profile.ssbSk, profile.username),
  cashuMnemonic: await decrypt(profile.cashuMnemonic, profile.username),
});

