const relative = require('./_includes/relative-path.cjs');
const site = require('./_data/site.cjs');
const {apiTables, elements, escapeHtml} = require('./_includes/lib.cjs');

// Compatibility aliases: documented with the element they alias.
const ALIASES = {'md-expressive-tab-bar': 'mnw-expressive-tab-bar'};

const importPathOf = (modulePath) => {
  if (modulePath.startsWith('src/marketing/')) return 'material-next-web-components/marketing.js';
  return `material-next-web-components/${modulePath.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
};

/**
 * Generated API reference: every element in custom-elements.json, grouped like
 * the catalog, with the same tables as its reference page.
 */
module.exports = class Api {
  data() {
    return {
      layout: 'docs.11ty.cjs',
      sidebar: false,
      title: 'API reference',
      heading: 'API reference',
      description:
        'Generated from the source with the custom elements analyzer: every element, with its properties, attributes, events, slots and styling hooks.',
    };
  }

  render(data) {
    const pages = data.collections.reference ?? [];
    const pageFor = (tag) => pages.find((p) => [].concat(p.data.tagName ?? []).includes(tag));
    const all = elements().filter((e) => !ALIASES[e.tagName]);
    const groups = site.categories
      .filter((c) => c.id !== 'guides')
      .map((category) => ({
        category,
        members: all.filter((e) => pageFor(e.tagName)?.data.category === category.id),
      }));
    const unlisted = all.filter((e) => !pageFor(e.tagName));
    if (unlisted.length) {
      throw new Error(`Elements without a reference page: ${unlisted.map((e) => e.tagName).join(', ')}`);
    }
    const intro = `<p>Each element's page has a live demo and usage notes; this page collects the generated API of all of them. A property marked <em>Property only</em> has no attribute: set it from JavaScript (objects, arrays and callbacks are always property only). Boolean attributes are on when present.</p>
<p>The JavaScript API of the marketing hub (controllers, <code>ScreenHost</code>, types) is listed on <a href="${relative(
      data.page.url,
      '/guides/marketing-api/'
    )}">Marketing API</a>.</p>`;
    return (
      intro +
      groups
        .map(
          ({category, members}) => `<h2 id="${category.id}">${escapeHtml(category.label)}</h2>
${members
  .map((e) => {
    const page = pageFor(e.tagName);
    const aliases = Object.entries(ALIASES)
      .filter(([, target]) => target === e.tagName)
      .map(([alias]) => `<code>&lt;${alias}&gt;</code>`);
    return `<h3 id="${e.tagName}"><code>&lt;${e.tagName}&gt;</code></h3>
<p class="api-meta"><code>import '${importPathOf(e.modulePath)}';</code> · class <code>${escapeHtml(e.name)}</code> · <a href="${relative(
      data.page.url,
      page.url
    )}">${escapeHtml(page.data.name)} guide and demo</a>${
      aliases.length ? ` · also registered as ${aliases.join(', ')} (compatibility alias)` : ''
    }</p>
${apiTables(e.tagName)}`;
  })
  .join('\n')}`
        )
        .join('\n')
    );
  }
};

