const header = require('./header.11ty.cjs');
const footer = require('./footer.11ty.cjs');
const nav = require('./nav.11ty.cjs');
const relative = require('./relative-path.cjs');

module.exports = function (data) {
  const {title, page, content} = data;
  return `
<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Built-in Material Design web components and reusable product views for web products.">
    <meta name="theme-color" content="#6750A4">
    <link rel="icon" href="${relative(page.url, '/favicon.svg')}" type="image/svg+xml">
    <link rel="manifest" href="${relative(page.url, '/site.webmanifest')}">
    <title>${title}</title>
    <link rel="stylesheet" href="${relative(page.url, '/docs.css')}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
    <script src="${relative(page.url, '/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js')}"></script>
    <script src="${relative(page.url, '/node_modules/lit/polyfill-support.js')}"></script>
    <script type="module" src="${relative(page.url, '/material-next-docs.bundled.js')}"></script>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <mnw-docs-shell>
      <mnw-docs-top-app-bar slot="nav">
        <div slot="leading">${header(data)}</div>
        ${nav(data)}
      </mnw-docs-top-app-bar>
      <mnw-docs-page>
        <div id="main-content" class="docs-route-content" tabindex="-1">
          ${content}
        </div>
      </mnw-docs-page>
      <div slot="footer">${footer()}</div>
    </mnw-docs-shell>
  </body>
</html>`;
};
