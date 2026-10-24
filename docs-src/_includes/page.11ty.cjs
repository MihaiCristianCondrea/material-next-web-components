const site = require('../_data/site.cjs');
const relative = require('./relative-path.cjs');
const {escapeHtml} = require('./lib.cjs');

const isActive = (url, link) =>
  link.href === '/' ? url === '/' : url.startsWith(link.prefix ?? link.href);

const githubMark =
  '<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';

/**
 * Every page: the top app bar with the site navigation, the content, the
 * footer. All URLs are relative to the page, so the site works under the
 * GitHub Pages subpath; the docs script makes the persistent chrome's URLs
 * absolute before its first client-side navigation.
 */
module.exports = function (data) {
  const {title, page, content, description} = data;
  const to = (target) => relative(page.url, target);
  const activeIndex = Math.max(
    0,
    site.topLevel.findIndex((link) => isActive(page.url, link))
  );
  const pageTitle = title ? `${title} · Material Next` : 'Material Next';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(
      description ??
        'Material Design web components for Lit: product pages, documentation and Android app marketing hubs.'
    )}">
    <meta name="theme-color" content="#6750A4">
    <link rel="icon" href="${to('/favicon.svg')}" type="image/svg+xml">
    <link rel="manifest" href="${to('/site.webmanifest')}">
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="${to('/docs.css')}">
    <!-- The sample app's theme, for the marketing demos on any page. -->
    <link rel="stylesheet" href="${to('/demos/assets/pocket-notes.css')}">
    ${(data.styles ?? [])
      .map((href) => `<link rel="stylesheet" href="${to(href)}">`)
      .join('\n    ')}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
    <script src="${to('/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js')}"></script>
    <script src="${to('/node_modules/lit/polyfill-support.js')}"></script>
    <script type="module" src="${to('/material-next-docs.bundled.js')}"></script>
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <mnw-docs-shell>
      <mnw-docs-top-app-bar slot="nav">
        <a slot="leading" class="brand" href="${to('/')}">
          <img class="brand-mark" src="${to('/logo.svg')}" alt="" width="32" height="32">
          <span class="brand-title">Material Next</span>
        </a>
        <div class="site-nav">
          ${site.topLevel
            .map((link, index) => `<a class="site-tab-link" href="${to(link.href)}" data-route-prefix="${
              link.prefix ?? link.href
            }"${index === activeIndex ? ' aria-current="page"' : ''}>${link.label}</a>`)
            .join('\n          ')}
        </div>
        <a slot="trailing" class="icon-link" href="${site.repository}" aria-label="Source on GitHub" title="Source on GitHub">${githubMark}</a>
      </mnw-docs-top-app-bar>
      <mnw-docs-page>
        <div id="main-content" class="docs-route-content" tabindex="-1">
          ${content}
        </div>
      </mnw-docs-page>
      <footer slot="footer" class="site-footer">
        <div class="site-footer__inner">
          <div>
            <p class="site-footer__name">Material Next</p>
            <p>Material Design web components for Lit, by Mihai-Cristian Condrea. BSD-3-Clause.</p>
          </div>
          <nav class="site-footer__links" aria-label="Project">
            <a href="${site.repository}">GitHub</a>
            <a href="${site.repository}/issues">Issues</a>
            <a href="${to('/release/')}">Release checklist</a>
            <a href="https://lit.dev/">Built with Lit</a>
            <a href="https://material-web.dev/">Material Web</a>
          </nav>
        </div>
      </footer>
    </mnw-docs-shell>
  </body>
</html>`;
};
