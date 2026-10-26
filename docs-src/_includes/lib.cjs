// Shared helpers for the documentation templates and shortcodes.
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');

const md = markdownIt({html: true});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const stripTags = (html = '') => String(html).replace(/<[^>]+>/g, '');

const slug = (value) =>
  stripTags(value)
    .replace(/&[a-z]+;/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Inline Markdown (backticks, links, emphasis) for manifest descriptions. */
const inline = (text = '') => md.renderInline(String(text));

/**
 * A code sample as `<mnw-code-block>`. The `<pre>` inside is the fallback shown
 * before the element upgrades or without JavaScript; the element hides it.
 */
// Newlines are written as &#10; so the block is one line: Markdown ends an
// HTML block at the first blank line, which would split a code sample.
const oneLine = (html) => html.replace(/\r?\n/g, '&#10;');

const codeBlock = (language, code, {copy = true, label} = {}) => {
  const text = String(code).replace(/\n$/, '');
  return `<mnw-code-block language="${escapeHtml(label ?? language)}"${
    copy ? ' copy' : ''
  } code="${oneLine(escapeHtml(text))}"><pre class="code-fallback"><code>${oneLine(
    escapeHtml(text)
  )}</code></pre></mnw-code-block>`;
};

// The custom elements manifest, read once per build.
let manifestCache;
const manifest = () => {
  if (!manifestCache) {
    manifestCache = JSON.parse(fs.readFileSync('custom-elements.json', 'utf8'));
  }
  return manifestCache;
};
const resetManifest = () => {
  manifestCache = undefined;
};

const elements = () =>
  manifest().modules.flatMap((module) =>
    (module.declarations ?? [])
      .filter((d) => d.customElement)
      .map((d) => ({...d, modulePath: module.path}))
  );

const element = (tagName) => {
  const found = elements().find((e) => e.tagName === tagName);
  if (!found) throw new Error(`No <${tagName}> in custom-elements.json`);
  return found;
};

const cell = (value) => (value === undefined || value === '' ? '—' : value);
const code = (value) => (value ? `<code>${escapeHtml(value)}</code>` : '—');

const table = (caption, head, rows) =>
  rows.length
    ? `<div class="table-wrap" role="region" tabindex="0" aria-label="${escapeHtml(
        caption
      )}"><table><caption>${escapeHtml(caption)}</caption><thead><tr>${head
        .map((h) => `<th scope="col">${h}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${cell(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`
    : '';

const textOf = (fragment) =>
  fragment
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, '&quot;');

/**
 * Labels every body cell with its column header (`data-label`), so phones can
 * show each row as a labelled card, and states the table roles explicitly,
 * which a stacked (display: block) table otherwise loses in some browsers.
 */
const labelTables = (html) =>
  html.replace(/<table>([\s\S]*?)<\/table>/g, (whole, inner) => {
    const head = inner.match(/<thead>([\s\S]*?)<\/thead>/);
    if (!head) return whole;
    const labels = [...head[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(
      (m) => textOf(m[1])
    );
    const body = inner
      .replace(/<(thead|tbody)>/g, '<$1 role="rowgroup">')
      .replace(/<th\b/g, '<th role="columnheader"')
      .replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
        let index = 0;
        return `<tr role="row">${cells.replace(
          /<td(\s[^>]*)?>/g,
          (m, attrs = '') =>
            `<td${attrs} role="cell" data-label="${labels[index++] ?? ''}">`
        )}</tr>`;
      });
    return `<table role="table">${body}</table>`;
  });

/**
 * The generated API of one element: properties (with their attribute, or
 * "property only"), events, slots, CSS custom properties and parts.
 * `heading` adds a heading level-3 per table group when several elements
 * share a page.
 */
const apiTables = (tagName, {heading = false} = {}) => {
  const e = element(tagName);
  const fields = (e.members ?? []).filter(
    (m) =>
      m.kind === 'field' &&
      m.privacy !== 'private' &&
      m.privacy !== 'protected' &&
      !m.static &&
      !m.readonly
  );
  const attrByField = new Map(
    (e.attributes ?? [])
      .filter((a) => a.fieldName)
      .map((a) => [a.fieldName, a.name])
  );
  const props = table(
    `<${tagName}> properties`,
    ['Property', 'Attribute', 'Type', 'Default', 'Description'],
    fields.map((f) => [
      code(f.name),
      attrByField.has(f.name)
        ? code(attrByField.get(f.name))
        : '<span class="muted">Property only</span>',
      code(f.type?.text),
      code(f.default),
      inline(f.description ?? ''),
    ])
  );
  // The analyzer reports `dispatchEvent(new CustomEvent(name))` with a
  // variable name as an event called "name"; the real events are documented
  // with @fires, so those placeholders are skipped.
  const events = table(
    `<${tagName}> events`,
    ['Event', 'Description'],
    (e.events ?? [])
      .filter((ev) => !(ev.name === 'name' && !ev.description))
      .map((ev) => [code(ev.name), inline(ev.description ?? '')])
  );
  const slots = table(
    `<${tagName}> slots`,
    ['Slot', 'Description'],
    (e.slots ?? []).map((s) => [
      s.name ? code(s.name) : '<span class="muted">Default</span>',
      inline(s.description ?? ''),
    ])
  );
  const cssProps = table(
    `<${tagName}> CSS custom properties`,
    ['Custom property', 'Description'],
    (e.cssProperties ?? []).map((p) => [
      code(p.name),
      inline(p.description ?? ''),
    ])
  );
  const parts = table(
    `<${tagName}> CSS parts`,
    ['Part', 'Description'],
    (e.cssParts ?? []).map((p) => [code(p.name), inline(p.description ?? '')])
  );
  const body = [props, events, slots, cssProps, parts].filter(Boolean).join('');
  const intro = e.description
    ? `<p class="api-summary">${inline(e.description)}</p>`
    : '';
  return `<section class="api-block" data-api="${tagName}">${
    heading
      ? `<h3 id="api-${slug(tagName)}"><code>&lt;${tagName}&gt;</code></h3>`
      : ''
  }${intro}${body || '<p class="muted">No public properties, events or slots.</p>'}</section>`;
};

// Demos: the markup in docs-src/_demos/<id>.html runs live inside the page,
// wired by src/docs/demos/<id>.ts when that file exists. The code shown is the
// same source, with in-repository imports rewritten to package paths.
const DEMO_HTML = path.join('docs-src', '_demos');
const DEMO_TS = path.join('src', 'docs', 'demos');

const packagePaths = (source) =>
  source
    .replace(
      /(['"])(?:\.\.\/)+marketing\/index\.js\1/g,
      "'material-next-web-components/marketing.js'"
    )
    .replace(
      /(['"])(?:\.\.\/)+([a-z-]+)\.js\1/g,
      "'material-next-web-components/$2.js'"
    )
    .replace(/^\s*\/\/ docs:hide.*\n/gm, '');

const readDemo = (id) => {
  const htmlFile = path.join(DEMO_HTML, `${id}.html`);
  const tsFile = path.join(DEMO_TS, `${id}.ts`);
  if (!fs.existsSync(htmlFile)) throw new Error(`Missing demo ${htmlFile}`);
  // Blank lines would end the HTML block in Markdown, so demos have none.
  const html = fs
    .readFileSync(htmlFile, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .join('\n');
  const ts = fs.existsSync(tsFile)
    ? packagePaths(
        fs
          .readFileSync(tsFile, 'utf8')
          .replace(/^\/\*\*[\s\S]*?\*\/\n\n?/, '')
          .replace(/\n$/, '')
      )
    : '';
  return {html, ts};
};

/** Strips demo-only attributes and wrappers from the markup shown as code. */
const shownMarkup = (html) =>
  html
    .replace(/\s+data-demo-[a-z-]+(="[^"]*")?/g, '')
    .replace(/^<!-- docs:hide -->[\s\S]*?<!-- \/docs:hide -->\n?/gm, '');

const demo = (id, caption = '', {code: showCode = true, stage = ''} = {}) => {
  const {html, ts} = readDemo(id);
  const blocks = showCode
    ? [codeBlock('html', shownMarkup(html)), ts ? codeBlock('ts', ts) : '']
        .filter(Boolean)
        .join('')
    : '';
  return `<figure class="demo">
<div class="demo__stage ${stage}" data-demo="${id}">
${html}
</div>
${caption ? `<figcaption class="demo__caption">${inline(caption)}</figcaption>` : ''}
</figure>
${blocks ? `<div class="demo__code">${blocks}</div>` : ''}`;
};

/**
 * A file as a code sample: an HTML page between its `<!-- example -->` and
 * `<!-- /example -->` lines (or whole), a TypeScript file without its licence
 * header and with package import paths.
 */
const source = (file, language) => {
  let text = fs.readFileSync(file, 'utf8');
  const lang = language ?? path.extname(file).slice(1);
  // `<!-- example -->` … `<!-- /example -->` in HTML, `// example` … `// /example` in code.
  const open = text.match(/^[ \t]*(?:<!-- example -->|\/\/ example)\n/m);
  const close = text.match(/^[ \t]*(?:<!-- \/example -->|\/\/ \/example)$/m);
  if (open && close && close.index > open.index) {
    text = text.slice(open.index + open[0].length, close.index);
    const indent = Math.min(
      ...text
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => l.match(/^\s*/)[0].length)
    );
    text = text
      .split('\n')
      .map((l) => l.slice(indent))
      .join('\n')
      .trim();
  }
  if (lang === 'ts' || lang === 'js') {
    text = packagePaths(text.replace(/^\/\*\*[\s\S]*?\*\/\n\n?/, '')).trim();
  }
  return codeBlock(lang, text);
};

module.exports = {
  labelTables,
  apiTables,
  source,
  codeBlock,
  demo,
  element,
  elements,
  escapeHtml,
  inline,
  manifest,
  md,
  resetManifest,
  slug,
  stripTags,
};
