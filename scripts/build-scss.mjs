import {mkdir, readdir, writeFile} from 'node:fs/promises';
import {dirname, join, relative} from 'node:path';
import {format, resolveConfig} from 'prettier';

const formatOptions = await resolveConfig('package.json');

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

// Marketing, launcher and app shell modules compile every non-partial stylesheet next to
// its element.
const modules = await Promise.all(
  ['src/marketing', 'src/launcher', 'src/app-shell'].map((dir) =>
    readdir(dir, {recursive: true, withFileTypes: true})
  )
);
for (const entry of modules.flat()) {
  if (!entry.isFile() || !entry.name.endsWith('.scss')) continue;
  if (entry.name.startsWith('_')) continue;
  const input = join(entry.parentPath, entry.name).replaceAll('\\', '/');
  outputs.push({
    input,
    output: input.replace(/\.scss$/, '-styles.ts'),
    lit: true,
  });
}

for (const item of outputs) {
  const result = await compileScss(item.input);
  await mkdir(dirname(item.output), {recursive: true});
  if (item.lit) {
    const scrollbarImport = relative(
      dirname(item.output),
      'src/scrollbar-styles.js'
    ).replaceAll('\\', '/');
    const scrollbarPath = scrollbarImport.startsWith('.')
      ? scrollbarImport
      : `./${scrollbarImport}`;
    // Into a template literal: backslashes first (a CSS escape such as
    // `content: "\201C"` would otherwise be read as a JavaScript escape),
    // then backticks and `${`.
    const cssText = result.css
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');
    await writeFormatted(
      item.output,
      `/**\n * @license\n * SPDX-License-Identifier: BSD-3-Clause\n *\n * Generated from ${relative(
        dirname(item.output),
        item.input
      )}.\n * Do not edit directly; run npm run build:scss.\n */\n\nimport {css} from 'lit';\nimport {scrollbarStyles} from '${scrollbarPath}';\n\nexport const styles = css\`\n\${scrollbarStyles}\n${cssText}\`;\n`
    );
  } else {
    await writeFormatted(
      item.output,
      `/**\n * Generated from ${item.input}.\n * Do not edit directly; run npm run build:scss.\n */\n\n${result.css}`
    );
  }
}

async function writeFormatted(output, source) {
  await writeFile(
    output,
    await format(source, {...formatOptions, filepath: output})
  );
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
