const {readFileSync} = require('node:fs');
const {join} = require('node:path');

// The app shell demo: a small admin console with client-side routing. Every
// route is its own static page, as a Worker serves the SPA's entry document
// for every console path, so reloads and deep links work.
const routes = ['', 'feed/', 'feed/android-16/', 'studio-bot/', 'lessons/', 'settings/'];
const body = readFileSync(
  join(__dirname, '../_includes/app-shell-demo.html'),
  'utf8'
);

module.exports = class {
  data() {
    return {
      routes,
      pagination: {data: 'routes', size: 1, alias: 'route'},
      permalink: (data) => `demos/app-shell/${data.route}index.html`,
      eleventyExcludeFromCollections: true,
    };
  }

  render({route}) {
    // <base> is the app's root, demos/app-shell/; every other relative URL on
    // the page, links included, resolves against it.
    const depth = route.split('/').filter(Boolean).length;
    const app = '../'.repeat(depth) || './';
    const root = '../../';
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <base href="${app}">
    <link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
    <title>Feed · Android Insider admin (demo)</title>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${root}docs.css">
    <script type="module" src="${root}app-shell-demo.js"></script>
  </head>
  <body class="console-demo">
${body.replaceAll('../demos/', `${root}demos/`)}
    <dialog id="leave-dialog" class="console-dialog">
      <h2>Discard your changes?</h2>
      <p>The lesson has edits that are not saved.</p>
      <div class="console-dialog__actions">
        <md-text-button data-answer="stay">Keep editing</md-text-button>
        <md-filled-tonal-button data-answer="leave">Discard</md-filled-tonal-button>
      </div>
    </dialog>
  </body>
</html>`;
  }
};
