import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const pnpmDir = path.join('node_modules', '.pnpm');
let libsodiumPath;
try {
  const entry = readdirSync(pnpmDir).find((name) => name.startsWith('libsodium@'));
  if (!entry) throw new Error('not found');
  libsodiumPath = path.join(pnpmDir, entry, 'node_modules', 'libsodium', 'dist', 'modules', 'libsodium.js');
} catch (err) {
  console.warn('libsodium not found, skipping patch');
  process.exit(0);
}

let content = readFileSync(libsodiumPath, 'utf8');
const target = 'document.currentScript&&(c=document.currentScript.src),c=c.startsWith("blob:")?"":c.substr(0,c.replace(/[?#].*/,"").lastIndexOf("/")+1)';
const replacement = 'typeof document!="undefined"&&document.currentScript&&(c=document.currentScript.src),c="string"==typeof c?c.startsWith("blob:")?"":c.substr(0,c.replace(/[?#].*/,"").lastIndexOf("/")+1):""';
if (content.includes(replacement)) {
  console.log('libsodium already patched');
  process.exit(0);
}
if (!content.includes(target)) {
  console.warn('libsodium patch target not found');
  process.exit(0);
}
content = content.replace(target, replacement);
writeFileSync(libsodiumPath, content);
console.log('Patched libsodium to handle missing document.currentScript');
