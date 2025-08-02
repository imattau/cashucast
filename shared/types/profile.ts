import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const SALT = 'cashucast';
const ITERATIONS = 100_000;
const KEYLEN = 32;
const DIGEST = 'sha256';

const deriveKeyB64 = (username: string): string =>
  pbkdf2Sync(username, SALT, ITERATIONS, KEYLEN, DIGEST).toString('base64');

const encrypt = (value: string, username: string): string => {
  const key = Buffer.from(deriveKeyB64(username), 'base64');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-ctr', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
};

const decrypt = (payload: string, username: string): string => {
  const key = Buffer.from(deriveKeyB64(username), 'base64');
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.slice(0, 16);
  const data = buf.slice(16);
  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
};

export interface Profile {
  ssbPk: string;
  ssbSk: string;            // encrypted with b64(pbkdf2(username))
  cashuMnemonic: string;    // encrypted with b64(pbkdf2(username))
  username: string;
  avatarBlob?: string;
}

export const createProfile = (data: {
  ssbPk: string;
  ssbSk: string;
  cashuMnemonic: string;
  username: string;
  avatarBlob?: string;
}): Profile => ({
  ssbPk: data.ssbPk,
  ssbSk: encrypt(data.ssbSk, data.username),
  cashuMnemonic: encrypt(data.cashuMnemonic, data.username),
  username: data.username,
  avatarBlob: data.avatarBlob,
});

export const decryptProfileSecrets = (profile: Profile): {
  ssbSk: string;
  cashuMnemonic: string;
} => ({
  ssbSk: decrypt(profile.ssbSk, profile.username),
  cashuMnemonic: decrypt(profile.cashuMnemonic, profile.username),
});

