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
    return md.render(source);
  }
};
