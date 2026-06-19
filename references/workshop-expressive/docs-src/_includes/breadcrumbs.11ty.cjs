const relative = require('./relative-path.cjs');

const homeUrl =
  'https://mihaicristiancondrea.github.io/workshop-expressive-web-components/';

const sections = [
  {url: '/examples/', label: 'Examples'},
  {url: '/api/', label: 'API'},
  {url: '/install/', label: 'Install'},
];

const titles = new Map([
  ['/examples/name-property/', 'Name property'],
  ['/examples/drawer/', 'Drawer'],
]);

module.exports = function ({page, title, name}) {
  const crumbs = [{id: 'home', label: 'Home', href: homeUrl}];
  const section = sections.find((item) => page.url.startsWith(item.url));

  if (section) {
    const isSectionPage = page.url === section.url;
    crumbs.push({
      id: section.label.toLowerCase(),
      label: section.label,
      ...(isSectionPage ? {} : {href: relative(page.url, section.url)}),
    });
  }

  const currentLabel = name ?? titles.get(page.url) ?? title;
  if (page.url === '/') {
    crumbs[0] = {id: 'home', label: 'Home'};
  } else if (!section || page.url !== section.url) {
    crumbs.push({id: 'current', label: currentLabel});
  }

  const escaped = JSON.stringify(crumbs).replace(/'/g, '&#39;');
  return `<ws-breadcrumbs class="page-breadcrumbs" crumbs='${escaped}'></ws-breadcrumbs>`;
};
