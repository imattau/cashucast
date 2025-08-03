import type { Plugin as VitePlugin } from 'vite';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import { readFile } from 'fs/promises';

export default function ssbReservedWordsFix(): VitePlugin {
  return {
    name: 'ssb-reserved-words-fix',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (id.includes('ssb-subset-ql/ql0.js')) {
        let transformed = code.replace(
          'const { author, type, private } = query',
          'const { author, type, private: isPrivate } = query',
        );
        transformed = transformed.replace(
          /"private":\$\{private\}/g,
          '"private":${isPrivate}',
        );
        return { code: transformed, map: null };
      }
      if (id.includes('ssb-bendy-butt/validation.js')) {
        let transformed = code.replace(
          "const public = authorBFE.subarray(2).toString('base64') + '.ed25519'",
          "const publicKey = authorBFE.subarray(2).toString('base64') + '.ed25519'",
        );
        transformed = transformed.replace(
          "const keys = { public, curve: 'ed25519' }",
          "const keys = { public: publicKey, curve: 'ed25519' }",
        );
        return { code: transformed, map: null };
      }
      return null;
    },
  };
}

export function ssbReservedWordsFixEsbuild(): EsbuildPlugin {
  return {
    name: 'ssb-reserved-words-fix-esbuild',
    setup(build) {
      build.onLoad({ filter: /ssb-subset-ql\/ql0\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code
          .replace(
            'const { author, type, private } = query',
            'const { author, type, private: isPrivate } = query',
          )
          .replace(/"private":\$\{private\}/g, '"private":${isPrivate}');
        return { contents: code, loader: 'js' };
      });

      build.onLoad({ filter: /ssb-bendy-butt\/validation\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code
          .replace(
            "const public = authorBFE.subarray(2).toString('base64') + '.ed25519'",
            "const publicKey = authorBFE.subarray(2).toString('base64') + '.ed25519'",
          )
          .replace(
            "const keys = { public, curve: 'ed25519' }",
            "const keys = { public: publicKey, curve: 'ed25519' }",
          );
        return { contents: code, loader: 'js' };
      });
    },
  };
}
