const relative = require('./relative-path.cjs');

module.exports = function ({page}) {
  const links = [
    {href: '/', label: 'Home'},
    {href: '/examples/', label: 'Examples'},
  ];

  const activeIndex = Math.max(
    0,
    links.findIndex(
      (link) => page.url === link.href || page.url.startsWith(link.href + '/')
    )
  );

  return `
<nav class="site-tabs" aria-label="Primary">
  <md-tabs active-tab-index="${activeIndex}">
    ${links
      .map((link, index) => {
        const selected = index === activeIndex;
        return `<md-primary-tab ${selected ? 'active' : ''}>
          <a class="site-tab-link" href="${relative(page.url, link.href)}" ${
            selected ? 'aria-current="page"' : ''
          }>${link.label}</a>
        </md-primary-tab>`;
      })
      .join('')}
  </md-tabs>
</nav>`;
};
