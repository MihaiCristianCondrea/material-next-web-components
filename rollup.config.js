/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

// The documentation site's scripts. Every file lands at the site root (chunks
// included), so URLs built from import.meta.url resolve against the root
// under any deployment path.
export default {
  input: {
    'material-next-docs.bundled': 'dist/docs/docs-entry.js',
    'hub-gallery': 'dist/docs/pages/hub-gallery.js',
    'hub-prototype': 'dist/docs/pages/hub-prototype.js',
    'docs-demo-pages': 'dist/docs/pages/demo-pages.js',
  },
  output: {
    dir: 'docs',
    format: 'esm',
    entryFileNames: '[name].js',
    chunkFileNames: 'chunk-[hash].js',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({preventAssignment: false, 'Reflect.decorate': 'undefined'}),
    resolve(),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary(),
  ],
};
