const relative = require('./relative-path.cjs');

module.exports = function ({page}) {
  return `
<a class="brand" href="${relative(page.url, '/')}">
  <span class="brand-mark" aria-hidden="true">M</span>
  <span class="brand-copy">
    <span class="brand-title">material-next-web-components</span>
    <span class="brand-subtitle">Material Design Lit components</span>
  </span>
</a>`;
};
