import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Some SSB dependencies published as CommonJS use identifiers such as
 * `private` and `public` for local variables. While that is valid in sloppy
 * mode, esbuild (used by Vite) parses dependencies in strict mode when
 * outputting ESM and fails on those identifiers.  We workaround this without
 * patching the dependencies by transforming the affected files on the fly and
 * renaming the problematic identifiers.
 */
function ssbReservedWordsFix() {
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

export default defineConfig({
  plugins: [ssbReservedWordsFix(), react()],
  optimizeDeps: {
    exclude: ['ssb-blobs'],
  },
});
