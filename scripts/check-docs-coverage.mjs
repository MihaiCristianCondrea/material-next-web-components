// Fails when the public API and the documentation disagree:
//  - an export of material-next-web-components/marketing.js missing from the
//    Marketing API page;
//  - a custom element in custom-elements.json without a reference page;
//  - a package.json export path missing from the Install page;
//  - a demo fragment without a page that uses it, or a page using a missing one.
// Runs on the build output: npm run build && npm run analyze first (npm run docs does both).
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const read = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const problems = [];

const marketing = await import(pathToFileURL('dist/marketing/index.js').href);
const apiPage = read('docs-src/guides/marketing-api.md');
for (const name of Object.keys(marketing)) {
  if (!new RegExp(`\`${name}\\b`).test(apiPage)) {
    problems.push(
      `marketing.js exports ${name}, missing from docs-src/guides/marketing-api.md`
    );
  }
}

const launcher = await import(pathToFileURL('dist/launcher/index.js').href);
const launcherPage = read('docs-src/examples/product-launcher.md');
for (const name of Object.keys(launcher)) {
  if (!new RegExp(`\`${name}\\b`).test(launcherPage)) {
    problems.push(
      `launcher.js exports ${name}, missing from docs-src/examples/product-launcher.md`
    );
  }
}

const appShell = await import(pathToFileURL('dist/app-shell/index.js').href);
const appShellPage = read('docs-src/examples/app-shell.md');
for (const name of Object.keys(appShell)) {
  if (!new RegExp(`\`${name}\\b`).test(appShellPage)) {
    problems.push(
      `app-shell.js exports ${name}, missing from docs-src/examples/app-shell.md`
    );
  }
}

const theme = await import(pathToFileURL('dist/theme/index.js').href);
const themePage = read('docs-src/examples/theme-controls.md');
for (const name of Object.keys(theme)) {
  if (!new RegExp(`\`${name}\\b`).test(themePage)) {
    problems.push(
      `theme.js exports ${name}, missing from docs-src/examples/theme-controls.md`
    );
  }
}

const pages = [
  ...readdirSync('docs-src/examples').map((f) => join('docs-src/examples', f)),
  ...readdirSync('docs-src/guides').map((f) => join('docs-src/guides', f)),
].filter((f) => f.endsWith('.md'));
const frontMatter = pages.map((f) => read(f).split('---')[1] ?? '').join('\n');
const manifest = JSON.parse(read('custom-elements.json'));
for (const module of manifest.modules) {
  for (const d of module.declarations ?? []) {
    // Shared base classes extend LitElement but register no tag.
    if (!d.customElement || !d.tagName) continue;
    if (
      !new RegExp(`tagName:(?:.|\\n[ \\t])*\\b${d.tagName}\\b`).test(
        frontMatter
      )
    ) {
      problems.push(
        `<${d.tagName}> has no reference page (tagName in docs-src/examples/*.md)`
      );
    }
  }
}

const install = read('docs-src/install.md');
const exportsMap = JSON.parse(read('package.json')).exports;
for (const key of Object.keys(exportsMap)) {
  if (key === '.' || key === './package.json' || key.includes('*')) continue;
  const name = key.replace(/^\.\//, '');
  if (!install.includes(name)) {
    problems.push(
      `package export ${key} is not mentioned in docs-src/install.md`
    );
  }
}

const allMarkdown = pages
  .concat(['docs-src/index.md', 'docs-src/install.md'])
  .map(read)
  .join('\n');
const used = new Set(
  [...allMarkdown.matchAll(/{%\s*(?:demo|preview)\s+"([^"]+)"/g)].map(
    (m) => m[1]
  )
);
const fragments = readdirSync('docs-src/_demos').map((f) =>
  f.replace(/\.html$/, '')
);
for (const id of used) {
  if (!fragments.includes(id))
    problems.push(
      `a page uses demo "${id}", but docs-src/_demos/${id}.html is missing`
    );
}
for (const id of fragments) {
  if (!used.has(id))
    problems.push(`docs-src/_demos/${id}.html is not used by any page`);
}
for (const file of readdirSync('src/docs/demos')) {
  const id = file.replace(/\.ts$/, '');
  if (id !== 'index' && !existsSync(`docs-src/_demos/${id}.html`)) {
    problems.push(`src/docs/demos/${file} has no markup in docs-src/_demos`);
  }
}

if (problems.length) {
  console.error(`Documentation coverage: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Documentation coverage: ${Object.keys(marketing).length} marketing, ${Object.keys(launcher).length} launcher, ${Object.keys(appShell).length} app shell and ${Object.keys(theme).length} theme exports, every element and package export documented, ${used.size} demos wired.`
);
