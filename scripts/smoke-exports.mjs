const entries = [
  'material-next-home.js',
  'code-block.js',
  'app-showcase.js',
  'expressive-tab-bar.js',
  'docs-page.js',
  'docs-shell.js',
  'docs-top-app-bar.js',
  'docs-vertical-tabs.js',
  'docs-table-of-contents.js',
];

for (const entry of entries) {
  await import(new URL(`../dist/${entry}`, import.meta.url));
}

console.log(`Imported ${entries.length} package entries.`);
