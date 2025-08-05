import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const pnpmDir = path.join('node_modules', '.pnpm');

function patchPackage(prefix, relativePath, target, replacement) {
  let file;
  try {
    const entry = readdirSync(pnpmDir).find((name) => name.startsWith(prefix));
    if (!entry) throw new Error('not found');
    file = path.join(pnpmDir, entry, 'node_modules', ...relativePath);
  } catch {
    console.warn(`${prefix} not found, skipping patch`);
    return;
  }

  let content = readFileSync(file, 'utf8');
  if (content.includes(replacement)) {
    console.log(`${prefix} already patched`);
    return;
  }
  if (!content.includes(target)) {
    console.warn(`${prefix} patch target not found`);
    return;
  }
  content = content.replace(target, replacement);
  writeFileSync(file, content);
  console.log(`Patched ${prefix}`);
}

const baseTarget = 'document.currentScript&&(VAR=document.currentScript.src),VAR=VAR.startsWith("blob:")?"":VAR.substr(0,VAR.replace(/[?#].*/,"").lastIndexOf("/")+1)';
const baseReplacement = 'typeof document!="undefined"&&document.currentScript&&(VAR=document.currentScript.src),VAR="string"==typeof VAR?VAR.startsWith("blob:")?"":VAR.substr(0,VAR.replace(/[?#].*/,"").lastIndexOf("/")+1):""';

patchPackage(
  'libsodium@',
  ['libsodium', 'dist', 'modules', 'libsodium.js'],
  baseTarget.replace(/VAR/g, 'c'),
  baseReplacement.replace(/VAR/g, 'c'),
);

patchPackage(
  'libsodium-sumo@',
  ['libsodium-sumo', 'dist', 'modules-sumo', 'libsodium-sumo.js'],
  baseTarget.replace(/VAR/g, 'a'),
  baseReplacement.replace(/VAR/g, 'a'),
);

const globalTarget = '}(this);';
const globalReplacement =
  '}(typeof globalThis !== "undefined" ? globalThis : this);';

patchPackage(
  'libsodium-wrappers@',
  ['libsodium-wrappers', 'dist', 'modules', 'libsodium-wrappers.js'],
  globalTarget,
  globalReplacement,
);

patchPackage(
  'libsodium-wrappers-sumo@',
  ['libsodium-wrappers-sumo', 'dist', 'modules-sumo', 'libsodium-wrappers.js'],
  globalTarget,
  globalReplacement,
);

