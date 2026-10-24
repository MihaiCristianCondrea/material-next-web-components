const site = require('../_data/site.cjs');
const page = require('./page.11ty.cjs');
const relative = require('./relative-path.cjs');
const {codeBlock, escapeHtml, inline, slug, stripTags} = require('./lib.cjs');

const attrJson = (value) => escapeHtml(JSON.stringify(value));

/** Gives every h2 and h3 an id (kept if present) and lists the h2s for the TOC. */
const withHeadingIds = (html) => {
  const toc = [];
  const used = new Set();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, text) => {
    let id = (attrs.match(/\sid="([^"]+)"/) ?? [])[1];
    if (!id) {
      id = slug(text) || 'section';
      while (used.has(id)) id += '-';
      attrs += ` id="${id}"`;
    }
    used.add(id);
    if (level === '2') toc.push({label: stripTags(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>'), href: `#${id}`});
    return `<h${level}${attrs}>${text}</h${level}>`;
  });
  return {html: out, toc};
};

const fallbackList = (items, activeIndex) =>
  `<ul class="nav-fallback">${items
    .map(
      (item, i) =>
        `<li><a href="${escapeHtml(item.href)}"${i === activeIndex ? ' aria-current="page"' : ''}>${escapeHtml(
          item.label
        )}</a></li>`
    )
    .join('')}</ul>`;

/** The component catalog, one vertical-tabs list per category. */
const sidebar = (data) => {
  const pages = data.collections.reference ?? [];
  const groups = site.categories
    .map((category) => {
      const members = pages.filter((p) => p.data.category === category.id);
      if (!members.length) return '';
      const items = members.map((p) => ({
        label: p.data.name,
        icon: p.data.icon || 'widgets',
        href: relative(data.page.url, p.url),
      }));
      const active = members.findIndex((p) => p.url === data.page.url);
      return `<mnw-docs-vertical-tabs class="side-group" heading="${escapeHtml(category.label)}" aria-label="${escapeHtml(
        category.label
      )}" active-index="${active}" items-json="${attrJson(items)}">${fallbackList(items, active)}</mnw-docs-vertical-tabs>`;
    })
    .join('');
  return `<details class="side-nav" open data-collapse-below="1100">
  <summary><span class="material-symbols-outlined" aria-hidden="true">menu</span>Browse components</summary>
  <nav aria-label="Components">${groups}</nav>
</details>`;
};

const tableOfContents = (toc) =>
  toc.length > 1
    ? `<mnw-docs-table-of-contents class="toc" active-index="0" items-json="${attrJson(toc)}">${fallbackList(
        toc,
        0
      )}</mnw-docs-table-of-contents>`
    : '';

const header = (data) => {
  const category = site.categories.find((c) => c.id === data.category);
  const meta = [];
  if (data.status) {
    meta.push(
      `<span class="status status--${data.status}">${site.statuses[data.status] ?? data.status}</span>`
    );
  }
  for (const tag of [].concat(data.tagName ?? [])) {
    meta.push(`<code class="tag-name">&lt;${escapeHtml(tag)}&gt;</code>`);
  }
  const imports = [].concat(data.importPath ?? []);
  return `<header class="page-header">
  ${category ? `<p class="breadcrumb"><a href="${relative(data.page.url, '/examples/')}#${category.id}">${escapeHtml(category.label)}</a></p>` : ''}
  <h1>${escapeHtml(data.name ?? data.heading ?? '')}</h1>
  ${data.description ? `<p class="lede">${inline(data.description)}</p>` : ''}
  ${meta.length ? `<p class="page-meta">${meta.join('')}</p>` : ''}
  ${imports.length ? `<div class="page-import">${codeBlock('ts', imports.map((p) => `import '${p}';`).join('\n'), {label: 'Import'})}</div>` : ''}
</header>`;
};

/**
 * Documentation pages. `sidebar: true` (component references and guides) adds
 * the catalog on the leading side; every page gets a table of contents from
 * its h2 headings. Below 1100px the catalog folds into a disclosure and the
 * table of contents moves under the page header.
 */
module.exports = function (data) {
  const {html, toc} = withHeadingIds(data.content);
  const hasSidebar = data.sidebar !== false;
  const tocHtml = tableOfContents(toc);
  return page({
    ...data,
    title: data.title ?? data.name,
    content: `<div class="docs-layout${hasSidebar ? '' : ' docs-layout--no-sidebar'}${tocHtml ? '' : ' docs-layout--no-toc'}">
  ${hasSidebar ? `<aside class="docs-layout__sidebar">${sidebar(data)}</aside>` : ''}
  <article class="docs-layout__main">
    ${header(data)}
    ${tocHtml ? `<details class="toc-inline"><summary>On this page</summary>${fallbackList(toc, -1)}</details>` : ''}
    <div class="prose">${html}</div>
  </article>
  ${tocHtml ? `<aside class="docs-layout__toc">${tocHtml}</aside>` : ''}
</div>`,
  });
};
