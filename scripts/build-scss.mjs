import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, relative} from 'node:path';

const outputs = [
  {
    input: 'src/material-next-home.scss',
    output: 'src/material-next-home-styles.ts',
    lit: true,
  },
  {
    input: 'src/app-showcase.scss',
    output: 'src/app-showcase-styles.ts',
    lit: true,
  },
  {input: 'src/code-block.scss', output: 'src/code-block-styles.ts', lit: true},
  {
    input: 'src/expressive-tab-bar.scss',
    output: 'src/expressive-tab-bar-styles.ts',
    lit: true,
  },
  {
    input: 'src/docs-vertical-tabs.scss',
    output: 'src/docs-vertical-tabs-styles.ts',
    lit: true,
  },
  {
    input: 'src/docs-table-of-contents.scss',
    output: 'src/docs-table-of-contents-styles.ts',
    lit: true,
  },
  {
    input: 'src/docs-page.scss',
    output: 'src/docs-page-styles.ts',
    lit: true,
  },
  {
    input: 'src/docs-shell.scss',
    output: 'src/docs-shell-styles.ts',
    lit: true,
  },
  {
    input: 'src/docs-top-app-bar.scss',
    output: 'src/docs-top-app-bar-styles.ts',
    lit: true,
  },
  {input: 'docs-src/docs.scss', output: 'docs-src/docs.css', lit: false},
];

for (const item of outputs) {
  const result = await compileScss(item.input);
  await mkdir(dirname(item.output), {recursive: true});
  if (item.lit) {
    const cssText = result.css.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    await writeFile(
      item.output,
      `/**\n * @license\n * SPDX-License-Identifier: BSD-3-Clause\n *\n * Generated from ${relative(
        dirname(item.output),
        item.input
      )}.\n * Do not edit directly; run npm run build:scss.\n */\n\nimport {css} from 'lit';\n\nexport const styles = css\`\n${cssText}\`;\n`
    );
  } else {
    await writeFile(
      item.output,
      `/**\n * Generated from ${item.input}.\n * Do not edit directly; run npm run build:scss.\n */\n\n${result.css}`
    );
  }
}

async function compileScss(input) {
  try {
    const sass = await import('sass');
    return sass.compile(input, {style: 'expanded'});
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') {
      throw error;
    }

    return {
      css: await (await import('node:fs/promises')).readFile(input, 'utf8'),
    };
  }
}
