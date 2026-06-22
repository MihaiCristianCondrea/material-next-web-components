const page = require('./page.11ty.cjs');
const relative = require('./relative-path.cjs');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const attrJson = (value) => escapeHtml(JSON.stringify(value));

const slug = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const addHeadingIds = (html) =>
  html.replace(/<h([23])>([^<]+)<\/h\1>/g, (_match, level, text) => {
    const id = slug(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });

const tocItems = [
  'Live demo',
  'Code',
  'API',
  'Slots',
  'Events',
  'Accessibility notes',
  'Design notes',
].map((label) => ({label, href: `#${slug(label)}`}));

module.exports = function (data) {
  return page({
    ...data,
    content: renderExample(data),
  });
};

const getManifestElements = (customElements) =>
  (customElements?.modules ?? []).flatMap((module) =>
    (module.declarations ?? []).filter(
      (declaration) => declaration.customElement
    )
  );

const renderGeneratedApi = (tagName, customElements) => {
  if (!tagName) return '';
  const element = getManifestElements(customElements).find(
    (declaration) => declaration.tagName === tagName
  );
  if (!element) return '';
  return `
    <section class="generated-api" aria-labelledby="generated-api">
      <h2 id="generated-api">Generated API reference</h2>
      ${renderApiTable(
        'Properties',
        ['name', 'attribute', 'description', 'type.text', 'default'],
        element.members?.filter((member) => member.kind === 'field')
      )}
      ${renderApiTable('Attributes', ['name', 'description', 'type.text', 'default'], element.attributes)}
      ${renderApiTable('Events', ['name', 'description'], element.events)}
      ${renderApiTable('Slots', [['name', '(default)'], 'description'], element.slots)}
      ${renderApiTable('CSS parts', ['name', 'description'], element.cssParts)}
    </section>
  `;
};

const get = (obj, path) => {
  let fallback = '';
  if (Array.isArray(path)) {
    [path, fallback] = path;
  }
  const parts = path.split('.');
  while (obj && parts.length) {
    obj = obj[parts.shift()];
  }
  return obj == null || obj === '' ? fallback : obj;
};

const renderApiTable = (heading, columns, rows = []) => {
  if (!rows.length) return '';
  return `
    <h3>${heading}</h3>
    <table>
      <thead><tr>${columns
        .map(
          (column) =>
            `<th>${escapeHtml((Array.isArray(column) ? column[0] : column).split('.')[0])}</th>`
        )
        .join('')}</tr></thead>
      <tbody>${rows
        .map(
          (row) =>
            `<tr>${columns
              .map((column) => `<td>${escapeHtml(get(row, column))}</td>`)
              .join('')}</tr>`
        )
        .join('')}</tbody>
    </table>
  `;
};

const renderExample = ({
  name,
  description,
  content,
  collections,
  page,
  tagName,
  customElements,
  generatedApi = false,
}) => {
  const examples = (collections.example ?? [])
    .slice()
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  const navItems = examples.map((post) => ({
    label: post.data.name,
    icon: post.data.icon || 'widgets',
    href: relative(page.url, post.url),
  }));
  const activeIndex = Math.max(
    0,
    examples.findIndex((post) => post.url === page.url)
  );

  return `
    <header class="example-header">
      <p class="eyebrow">Component example</p>
      <h1>${escapeHtml(name)}</h1>
      ${description ? `<p class="lede">${escapeHtml(description)}</p>` : ''}
    </header>
    <section class="examples-layout">
      <aside class="examples-nav">
        <mnw-docs-vertical-tabs heading="Elements" active-index="${activeIndex}" items-json="${attrJson(navItems)}"></mnw-docs-vertical-tabs>
      </aside>
      <article class="examples-content example-content">
        ${addHeadingIds(content)}
        ${generatedApi ? renderGeneratedApi(tagName, customElements) : ''}
      </article>
      <aside class="examples-toc">
        <mnw-docs-table-of-contents items-json="${attrJson(tocItems)}"></mnw-docs-table-of-contents>
      </aside>
    </section>
  `;
};
