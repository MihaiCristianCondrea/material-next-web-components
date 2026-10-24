const site = require('../_data/site.cjs');
const relative = require('../_includes/relative-path.cjs');
const {escapeHtml, inline} = require('../_includes/lib.cjs');

/** The component catalog: every reference page, by category, from its front matter. */
module.exports = class Catalog {
  data() {
    return {
      layout: 'docs.11ty.cjs',
      sidebar: false,
      title: 'Components',
      heading: 'Components',
      description:
        'Every public element and guide, with a live demo, copyable code and the generated API on each page.',
    };
  }

  render(data) {
    const pages = data.collections.reference ?? [];
    return site.categories
      .map((category) => {
        const members = pages.filter((p) => p.data.category === category.id);
        if (!members.length) return '';
        return `<section class="catalog-section" aria-labelledby="${category.id}">
<h2 id="${category.id}">${escapeHtml(category.label)}</h2>
<p>${escapeHtml(category.description)}</p>
<div class="catalog-grid">
${members
  .map((p) => {
    const tags = [].concat(p.data.tagName ?? []);
    return `<article class="catalog-card">
<div class="catalog-card__top"><span class="catalog-card__icon material-symbols-outlined" aria-hidden="true">${escapeHtml(
      p.data.icon ?? 'widgets'
    )}</span>${
      p.data.status ? `<span class="status status--${p.data.status}">${site.statuses[p.data.status]}</span>` : ''
    }</div>
<h3><a href="${relative(data.page.url, p.url)}">${escapeHtml(p.data.name)}</a></h3>
<p>${inline(p.data.description ?? '')}</p>
${tags.length ? `<code>${tags.map((t) => `&lt;${escapeHtml(t)}&gt;`).join(' ')}</code>` : ''}
</article>`;
  })
  .join('\n')}
</div>
</section>`;
      })
      .join('\n');
  }
};
