/*
 * Licensed under GPL-3.0-or-later
 * ssb-reserved-words-fix module.
 */
/**
 * Provides Vite and Esbuild plugins that rewrite Secure Scuttlebutt (SSB) modules
 * which use JavaScript reserved words or Node.js-only patterns. The plugins run
 * during bundling to rename problematic identifiers and adjust imports so the
 * modules can be processed by modern tooling for browser builds.
 */
import type { Plugin as VitePlugin } from 'vite';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import { readFile } from 'fs/promises';

/**
 * Create a Vite plugin that patches SSB dependencies before other transforms.
 * It targets files that contain identifiers such as `private` or `public` and
 * replaces them with safe alternatives while also converting CommonJS `require`
 * calls to ESM imports where necessary. Include this plugin in the Vite config
 * when bundling the SSB stack for the browser.
 *
 * @returns {VitePlugin} Vite plugin that rewrites reserved words and imports.
 */
export default function ssbReservedWordsFix(): VitePlugin {
  return {
    name: 'ssb-reserved-words-fix',
    enforce: 'pre',
    transform(code: string, id: string) {
      const normalized = id.replace(/\\/g, '/');
      if (normalized.includes('ssb-subset-ql/ql0.js')) {
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
      if (normalized.includes('ssb-bendy-butt/validation.js')) {
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
      if (normalized.includes('ssb-browser-core/net.js')) {
        let transformed = code
          .replace("const SecretStack = require('secret-stack')", "import SecretStack from 'secret-stack';")
          .replace("const caps = require('ssb-caps')", "import caps from 'ssb-caps';")
          .replace("const ssbKeys = require('ssb-keys')", "import ssbKeys from 'ssb-keys';")
          .replace("const helpers = require('./core-helpers')", "import helpers from './core-helpers';")
          .replace("const path = require('path')", '')
          .replace('exports.init = function(dir, overwriteConfig, extraModules) {',
            'export function init(dir, overwriteConfig = {}, extraModules) {')
          .replace(
            "var keys = ssbKeys.loadOrCreateSync(path.join(dir, 'secret'))",
            'var keys = overwriteConfig.keys || ssbKeys.generate()'
          );
        transformed += '\nexport default { init };';
        return { code: transformed, map: null };
      }
      if (normalized.includes('ssb-browser-core/dist/bundle-core.js')) {
        let transformed = code
          .replace(
            'persistentStorage=navigator.persistentStorage||navigator.webkitPersistentStorage',
            'persistentStorage=navigator.storage',
          )
          .replace(
            'function requestQuota(t,e,r){if("function"==typeof e)return requestQuota(t,!0,e);persistentStorage.queryUsageAndQuota(function(i,n){if(n&&!e)return r(null,n);persistentStorage.requestQuota(t,function(t){r(null,t)},r)},r)}',
            'async function requestQuota(t,e,r){try{if("function"==typeof e)return requestQuota(t,!0,e);const n=persistentStorage.persist?await persistentStorage.persist():false;const i=await persistentStorage.estimate();r(null,i.quota);}catch(i){r(i);}}',
          );
        return { code: transformed, map: null };
      }
      if (normalized.includes('ssb-blobs/index.js')) {
        let transformed = code.replace(
          "const path = require('path')",
          "import path from 'path';",
        );
        return { code: transformed, map: null };
      }
      return null;
    },
  };
}

/**
 * Create an esbuild plugin that performs the same transformations as
 * {@link ssbReservedWordsFix} using esbuild's `onLoad` hooks. It rewrites the
 * contents of SSB-related files on the fly to avoid reserved words and to adjust
 * imports, making the modules compatible with esbuild-based tooling.
 *
 * @returns {EsbuildPlugin} Esbuild plugin applying the SSB fixes.
 */
export function ssbReservedWordsFixEsbuild(): EsbuildPlugin {
  return {
    name: 'ssb-reserved-words-fix-esbuild',
    setup(build) {
      build.onLoad({ filter: /ssb-subset-ql[\\/]ql0\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code
          .replace(
            'const { author, type, private } = query',
            'const { author, type, private: isPrivate } = query',
          )
          .replace(/"private":\$\{private\}/g, '"private":${isPrivate}');
        return { contents: code, loader: 'js' };
      });

      build.onLoad({ filter: /ssb-bendy-butt[\\/]validation\.js$/ }, async (args) => {
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

      build.onLoad({ filter: /ssb-browser-core[\\/]net\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code
          .replace("const SecretStack = require('secret-stack')", "import SecretStack from 'secret-stack';")
          .replace("const caps = require('ssb-caps')", "import caps from 'ssb-caps';")
          .replace("const ssbKeys = require('ssb-keys')", "import ssbKeys from 'ssb-keys';")
          .replace("const helpers = require('./core-helpers')", "import helpers from './core-helpers';")
          .replace("const path = require('path')", '')
          .replace('exports.init = function(dir, overwriteConfig, extraModules) {',
            'export function init(dir, overwriteConfig = {}, extraModules) {')
          .replace(
            "var keys = ssbKeys.loadOrCreateSync(path.join(dir, 'secret'))",
            'var keys = overwriteConfig.keys || ssbKeys.generate()'
          );
        code += '\nexport default { init };';
        return { contents: code, loader: 'js' };
      });

      build.onLoad({ filter: /ssb-browser-core[\\/]dist[\\/]bundle-core\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code
          .replace(
            'persistentStorage=navigator.persistentStorage||navigator.webkitPersistentStorage',
            'persistentStorage=navigator.storage',
          )
          .replace(
            'function requestQuota(t,e,r){if("function"==typeof e)return requestQuota(t,!0,e);persistentStorage.queryUsageAndQuota(function(i,n){if(n&&!e)return r(null,n);persistentStorage.requestQuota(t,function(t){r(null,t)},r)},r)}',
            'async function requestQuota(t,e,r){try{if("function"==typeof e)return requestQuota(t,!0,e);const n=persistentStorage.persist?await persistentStorage.persist():false;const i=await persistentStorage.estimate();r(null,i.quota);}catch(i){r(i);}}',
          );
        return { contents: code, loader: 'js' };
      });

      build.onLoad({ filter: /ssb-blobs[\\/]index\.js$/ }, async (args) => {
        let code = await readFile(args.path, 'utf8');
        code = code.replace(
          "const path = require('path')",
          "import path from 'path';",
        );
        return { contents: code, loader: 'js' };
      });
    },
  };
}
