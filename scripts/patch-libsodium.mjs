import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const pnpmDir = path.join('node_modules', '.pnpm');

function patchPackage(prefix, relativePath, target, replacement) {
  let file;
  let entry;
  try {
    entry = readdirSync(pnpmDir).find((name) => name.startsWith(prefix));
    if (!entry) throw new Error('package not found');
    file = path.join(pnpmDir, entry, 'node_modules', ...relativePath);
  } catch {
    console.error(
      `${prefix} not found. The package version may have changed.\n` +
        'Update scripts/patch-libsodium.mjs to match the new version.',
    );
    process.exit(1);
  }

  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    console.error(
      `Failed to read ${file} for ${prefix}. The package layout may have changed.\n` +
        'Update scripts/patch-libsodium.mjs accordingly.',
    );
    process.exit(1);
  }
  if (content.includes(replacement)) {
    console.log(`${prefix} already patched`);
    return;
  }
  if (!content.includes(target)) {
    console.error(
      `${prefix} patch target not found. The package contents may have changed.\n` +
        'Inspect the file and update scripts/patch-libsodium.mjs with the new target and replacement.',
    );
    process.exit(1);
  }
  content = content.replace(target, replacement);
  writeFileSync(file, content);
  console.log(`Patched ${prefix}`);
}

const baseTarget =
  'document.currentScript&&(VAR=document.currentScript.src),VAR=VAR.startsWith("blob:")?"":VAR.substr(0,VAR.replace(/[?#].*/,"").lastIndexOf("/")+1)';
const baseReplacement =
  'typeof document!="undefined"&&document.currentScript&&(VAR=document.currentScript.src),VAR="string"==typeof VAR?VAR.startsWith("blob:")?"":VAR.substr(0,VAR.replace(/[?#].*/,"").lastIndexOf("/")+1):""';

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

