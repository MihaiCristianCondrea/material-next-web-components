const relative = require('./relative-path.cjs');

module.exports = function ({page}) {
  const links = [
    {href: '/', label: 'Home'},
    {href: '/examples/', label: 'Examples'},
    {href: '/api/', label: 'API'},
    {href: '/install/', label: 'Install'},
  ];

  return `
<nav class="site-tabs" aria-label="Primary">
  ${links
    .map((link) => {
      const selected =
        page.url === link.href || page.url.startsWith(link.href + '/');
      return `<a href="${relative(page.url, link.href)}" ${
        selected ? 'aria-current="page"' : ''
      }>${link.label}</a>`;
    })
    .join('')}
</nav>`;
};
