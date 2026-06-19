const relative = require('./relative-path.cjs');

const homeUrl =
  'https://mihaicristiancondrea.github.io/workshop-expressive-web-components/';

const items = [
  {url: homeUrl, label: 'Home', icon: 'ri-home-5-line'},
  {url: '/examples/', label: 'Examples', icon: 'ri-layout-grid-line'},
];

module.exports = function ({page}) {
  const currentUrl = page.url;
  const links = items
    .map((item) => {
      const selected =
        item.label === 'Home'
          ? currentUrl === '/'
          : currentUrl === item.url || currentUrl.startsWith(item.url);
      const current = selected ? ' aria-current="page"' : '';

      return `<ws-tab${selected ? ' selected' : ''} href="${
        item.url.startsWith('http') ? item.url : relative(page.url, item.url)
      }"${current}>
    <i slot="icon" class="${item.icon}" aria-hidden="true"></i>
    <span>${item.label}</span>
  </ws-tab>`;
    })
    .join('\n  ');

  return `
<ws-app-bar class="site-nav" aria-label="Primary" sticky>
  <a class="site-logo" slot="leading" href="${homeUrl}" aria-label="Go to WorkShop Expressive home" data-site-logo>
    <ws-brand-mark mark-only size="40px" aria-hidden="true"></ws-brand-mark>
  </a>
  <ws-tabs class="site-tabs" aria-label="Documentation sections">
  ${links}
  </ws-tabs>
  <ws-switch slot="trailing" class="theme-switch" aria-label="Use dark theme" data-theme-toggle>
    <i slot="unchecked-icon" class="ri-sun-line" aria-hidden="true"></i>
    <i slot="checked-icon" class="ri-moon-line" aria-hidden="true"></i>
  </ws-switch>
</ws-app-bar>`;
};
