const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {md} = require('./_includes/lib.cjs');

module.exports = class {
  data() {
    return {
      layout: 'docs.11ty.cjs',
      sidebar: false,
      title: 'Changelog',
      heading: 'Changelog',
      description: 'Material Next changes, maintained in one changelog.',
      permalink: 'changelog/index.html',
    };
  }
  render() {
    const source = readFileSync(join(__dirname, '../CHANGELOG.md'), 'utf8')
      .replace(/^# Changelog\s*/, '')
      .replace(/^# /gm, '## ');
    // A release heading is its date, with its version on the next line; the
    // version gives the heading its id and its entry in "On this page".
    return md
      .render(source)
      .replace(
        /<h2>([^<]+)<\/h2>\s*<p><strong>Version:<\/strong> <code>([^<]+)<\/code><\/p>/g,
        (_, date, version) =>
          `<h2 id="v${version.replace(/\./g, '-')}" data-toc-label="${version} · ${date}">${date}</h2>\n<p><strong>Version:</strong> <code>${version}</code></p>`
      );
  }
};
