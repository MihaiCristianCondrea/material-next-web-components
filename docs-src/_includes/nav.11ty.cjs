const relative = require('./relative-path.cjs');

const defaultLinks = [
  {href: '/', label: 'Home', route: 'home'},
  {href: '/install/', label: 'Install', route: 'install'},
  {href: '/examples/', label: 'Examples', route: 'examples'},
  {href: '/api/', label: 'API', route: 'api'},
  {href: '/roadmap/', label: 'Roadmap', route: 'roadmap'},
];
const isActive = (pageUrl, link) =>
  link.href === '/'
    ? pageUrl === '/'
    : pageUrl === link.href || pageUrl.startsWith(link.href);

module.exports = function ({page, navigation}) {
  const links = navigation?.topLevel ?? defaultLinks;
  const activeIndex = Math.max(
    0,
    links.findIndex((link) => isActive(page.url, link))
  );

  return `<md-tabs class="site-tabs" active-tab-index="${activeIndex}">
    ${links
      .map((link, index) => {
        const selected = index === activeIndex;
        return `<md-primary-tab ${selected ? 'active' : ''}>
          <a class="site-tab-link" href="${relative(page.url, link.href)}" data-route="${link.route}" data-route-prefix="${link.href}" ${
            selected ? 'aria-current="page"' : ''
          }>${link.label}</a>
        </md-primary-tab>`;
      })
      .join('')}
  </md-tabs>`;
};
