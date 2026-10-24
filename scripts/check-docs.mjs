// Checks the built documentation site the way GitHub Pages serves it: under
// the /material-next-web-components/ repository subpath, with a 404 for any
// path outside the build.
//
//   npm run docs && npm run docs:check
//   node scripts/check-docs.mjs --screenshots=out/   also saves a screenshot of every page
//
// It visits every page reachable by links from the home page (links inside
// shadow roots and iframe pages included) and fails on: pages or assets that do not load,
// console errors, uncaught exceptions, links to missing pages, links to
// missing #anchors, undefined custom elements, and broken client-side
// navigation (link clicks, Back and Forward, deep-page refresh).
//
// Uses Playwright's Chromium; set CHROME_PATH to use another Chromium binary.
import {createReadStream, existsSync, mkdirSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, join, normalize, resolve} from 'node:path';
import {chromium} from 'playwright';

const BASE_PATH = '/material-next-web-components/';
const root = resolve('docs');
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.replace(/^--/, '').split('='))
    .map(([k, v]) => [k, v ?? true])
);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('docs/index.html not found: run npm run docs first.');
  process.exit(1);
}

// A static server with GitHub Pages' rules: directories serve index.html,
// a directory without a trailing slash redirects, anything else is a 404.
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith(BASE_PATH)) {
    res.writeHead(404).end('Not found');
    return;
  }
  const rel = decodeURIComponent(url.pathname.slice(BASE_PATH.length));
  let file = normalize(join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, {location: `${url.pathname}/${url.search}`}).end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = `${origin}${BASE_PATH}`;

const browser = await chromium.launch(
  process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}
);
const problems = [];
const problem = (where, message) => problems.push(`${where}: ${message}`);

const watch = (page, label) => {
  page.on('console', (m) => {
    if (m.type() === 'error') problem(label(), `console error: ${m.text()}`);
  });
  page.on('pageerror', (e) => problem(label(), `uncaught: ${e.message}`));
  page.on('response', (r) => {
    if (r.url().startsWith(origin) && r.status() >= 400) {
      problem(label(), `${r.status()} ${r.url().slice(origin.length)}`);
    }
  });
  page.on('requestfailed', (r) => {
    // External fonts may be blocked in sandboxes; everything local must load.
    if (r.url().startsWith(origin)) {
      problem(label(), `failed ${r.url().slice(origin.length)}`);
    }
  });
};

/** Every href in the document and in open shadow roots, plus ids for anchors. */
const collect = () => {
  const hrefs = new Set();
  const ids = new Set();
  const undefinedTags = new Set();
  const walk = (node) => {
    for (const el of node.querySelectorAll('*')) {
      if (el.id) ids.add(el.id);
      // Iframe pages (the full-page demos) are pages too.
      const src = el.localName === 'iframe' ? el.getAttribute('src') : null;
      if (src) hrefs.add(new URL(src, el.baseURI).href);
      const href = el.getAttribute('href');
      if (href && (el.tagName === 'A' || el.hasAttribute('href'))) {
        hrefs.add(new URL(href, el.baseURI).href);
      }
      if (el.localName.includes('-') && !customElements.get(el.localName)) {
        undefinedTags.add(el.localName);
      }
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
  return {hrefs: [...hrefs], ids: [...ids], undefinedTags: [...undefinedTags]};
};

const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((r) => setTimeout(r, 150));
  });

let current = '';
const page = await browser.newPage({viewport: {width: 1280, height: 900}});
watch(page, () => current);

const visited = new Map();
const queue = [base];
const anchorChecks = [];
while (queue.length) {
  const url = queue.shift();
  const key = url.split('#')[0];
  if (visited.has(key)) continue;
  current = key.slice(origin.length);
  const response = await page.goto(key, {waitUntil: 'networkidle'});
  visited.set(key, response?.status());
  if (!response || response.status() >= 400) continue;
  await settle(page);
  const {hrefs, ids, undefinedTags} = await page.evaluate(collect);
  for (const tag of undefinedTags) problem(current, `<${tag}> is not defined`);
  visited.set(key, {
    status: response.status(),
    ids: new Set(ids),
    title: await page.title(),
  });
  if (args.screenshots) {
    mkdirSync(args.screenshots, {recursive: true});
    const name =
      current.replace(BASE_PATH, '').replace(/\/$/, '').replace(/[/.]/g, '_') ||
      'home';
    await page.screenshot({
      path: join(args.screenshots, `${name}.png`),
      fullPage: true,
    });
  }
  for (const href of hrefs) {
    const u = new URL(href);
    if (u.origin !== origin) continue;
    if (!u.pathname.startsWith(BASE_PATH)) {
      problem(current, `link outside the site subpath: ${u.pathname}`);
      continue;
    }
    if (extname(u.pathname) && !u.pathname.endsWith('.html')) continue;
    if (u.hash)
      anchorChecks.push({
        from: current,
        page: href.split('#')[0],
        id: decodeURIComponent(u.hash.slice(1)),
      });
    queue.push(href);
  }
}

for (const {from, page: target, id} of anchorChecks) {
  const info = visited.get(target);
  if (info && typeof info === 'object' && !info.ids.has(id)) {
    problem(
      from,
      `link to missing anchor ${target.slice(origin.length)}#${id}`
    );
  }
}
for (const [url, info] of visited) {
  const status = typeof info === 'object' ? info.status : info;
  if (status >= 400 || status === undefined)
    problem(url.slice(origin.length), `HTTP ${status}`);
}

// Client-side navigation: clicks keep one document, Back and Forward restore
// pages, and a deep page loads directly (as a refresh would).
const nav = await browser.newPage({viewport: {width: 1280, height: 900}});
watch(nav, () => `navigation ${current}`);
current = 'home';
await nav.goto(base, {waitUntil: 'networkidle'});
await nav.evaluate(() => (window.__docsDocument = true));
const titleOf = (path) => visited.get(`${base}${path}`)?.title;
// A client-side navigation is done when the page shows the target's title.
const arrived = async (path) => {
  await nav.waitForURL(`${base}${path}`);
  await nav.waitForFunction(
    (title) => document.title === title,
    titleOf(path),
    {timeout: 10000}
  );
};
const clickThrough = [];
for (const path of ['examples/', 'install/', 'api/', 'examples/']) {
  current = path;
  const link = nav.locator(`a[href$="${path}"]`).first();
  if (!(await link.count())) {
    problem('navigation', `no link to ${path} in the page`);
    continue;
  }
  await link.click();
  await arrived(path);
  await settle(nav);
  clickThrough.push(path);
}
const sameDocument = await nav.evaluate(() => window.__docsDocument === true);
if (!sameDocument) problem('navigation', 'a link click reloaded the page');
current = 'back';
try {
  await nav.goBack();
  await arrived('api/');
  await nav.goBack();
  await arrived('install/');
  await nav.goForward();
  await arrived('api/');
} catch (error) {
  problem('navigation', `Back and Forward: ${error.message.split('\n')[0]}`);
}
await settle(nav);
const h1 = await nav.locator('.docs-route-content h1').first().textContent();
if (!/api/i.test(h1 ?? ''))
  problem('navigation', `after Forward the page shows "${h1}"`);
// The persistent top app bar must still point at the right pages.
const tabHref = await nav
  .locator('.site-tab-link', {hasText: 'Install'})
  .getAttribute('href');
if (new URL(tabHref, nav.url()).href !== `${base}install/`) {
  problem(
    'navigation',
    `after navigating, the Install link points at ${tabHref}`
  );
}

// Phone width: no page may scroll sideways. Wide content (tables, code)
// scrolls inside its own container.
const phone = await browser.newPage({viewport: {width: 360, height: 780}});
for (const url of visited.keys()) {
  // Capture mode (panel=none) is the bare screen at its exact size, on purpose.
  if (new URL(url).searchParams.get('panel') === 'none') continue;
  await phone.goto(url, {waitUntil: 'networkidle'});
  await settle(phone);
  const width = await phone.evaluate(
    () => document.documentElement.scrollWidth
  );
  if (width > 361)
    problem(
      url.slice(origin.length),
      `scrolls sideways at 360px (content is ${width}px wide)`
    );
}
await phone.close();

const deepPages = [...visited.keys()].filter(
  (u) => u.split(BASE_PATH)[1]?.split('/').filter(Boolean).length >= 2
);
for (const deep of deepPages.slice(0, 3)) {
  current = `refresh ${deep.slice(origin.length)}`;
  await nav.goto(deep, {waitUntil: 'networkidle'});
  await nav.reload({waitUntil: 'networkidle'});
  const {undefinedTags} = await nav.evaluate(collect);
  for (const tag of undefinedTags) problem(current, `<${tag}> is not defined`);
}

// Demos: each does what its page says, as a reader would use it.
const interactions = [];
const ctx = await browser.newContext({viewport: {width: 1280, height: 900}});
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], {origin});
const demo = await ctx.newPage();
watch(demo, () => `demo ${current}`);
const check = async (name, path, run) => {
  current = path;
  try {
    await demo.goto(`${base}${path}`, {waitUntil: 'networkidle'});
    await settle(demo);
    await run(demo);
    interactions.push(name);
  } catch (error) {
    problem(`demo ${path}`, `${name}: ${error.message.split('\n')[0]}`);
  }
};
const logOf = (page, root = '[data-demo]') =>
  page.locator(`${root} .demo-log`).first();
const expectText = async (locator, pattern) => {
  await locator.waitFor();
  for (let i = 0; i < 40; i++) {
    if (pattern.test((await locator.textContent()) ?? '')) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`expected ${pattern}, got "${await locator.textContent()}"`);
};

await check('copy a code block', 'examples/code-block/', async (p) => {
  await p
    .locator('[data-demo="code-block"] mnw-code-block')
    .first()
    .locator('md-assist-chip')
    .click();
  await expectText(logOf(p), /mnw-code-copy: \d+ characters/);
  const copied = await p.evaluate(() => navigator.clipboard.readText());
  if (!copied.startsWith('npm install'))
    throw new Error(`clipboard holds "${copied}"`);
});
await check(
  'select a tab, cancel navigate',
  'examples/expressive-tab-bar/',
  async (p) => {
    const before = p.url();
    await p
      .locator('[data-demo] mnw-expressive-tab-bar')
      .first()
      .locator('md-primary-tab')
      .nth(2)
      .click();
    await expectText(
      logOf(p),
      /change: activeIndex 2[\s\S]*navigate: #accessibility \(canceled\)/
    );
    if (p.url() !== before)
      throw new Error(`the canceled link changed the URL to ${p.url()}`);
  }
);
await check('limit the app showcase', 'examples/app-showcase/', async (p) => {
  const cards = p.locator('mnw-app-showcase md-outlined-card');
  await cards.first().waitFor();
  if ((await cards.count()) !== 2)
    throw new Error(`${await cards.count()} cards from the fixture`);
  await p.locator('[data-limit="1"]').click();
  await p.waitForFunction(
    () =>
      document
        .querySelector('mnw-app-showcase')
        .shadowRoot.querySelectorAll('md-outlined-card').length === 1
  );
});
await check(
  'cancel docs navigation',
  'examples/docs-navigation/',
  async (p) => {
    await p
      .locator('[data-demo] mnw-docs-vertical-tabs md-list-item')
      .nth(1)
      .click();
    await expectText(
      logOf(p),
      /navigate: index 1, \.\.\/expressive-tab-bar\/ \(link canceled\)/
    );
    if (!p.url().endsWith('/examples/docs-navigation/'))
      throw new Error(`moved to ${p.url()}`);
  }
);
await check(
  'toggle a screen card to dark',
  'examples/screen-card/',
  async (p) => {
    const card = p.locator('[data-demo] mnw-screen-card').first();
    await card.getByRole('button', {name: 'Dark theme for Notes'}).click();
    await expectText(logOf(p), /card-theme-toggle: Notes dark = true/);
    const theme = await card.locator('.card-screen').getAttribute('data-theme');
    if (theme !== 'dark')
      throw new Error(`the hosted screen's data-theme is ${theme}`);
  }
);
await check(
  'change a preview setting',
  'examples/preview-controls/',
  async (p) => {
    await p
      .locator('[data-demo] mnw-preview-controls md-outlined-segmented-button')
      .nth(2)
      .click();
    await expectText(logOf(p), /settings-change .*"theme":"dark"/);
  }
);
await check('frame every device', 'examples/device-frame/', async (p) => {
  const frames = p.locator('[data-demo] mnw-device-frame');
  if ((await frames.count()) !== 3) throw new Error('expected three frames');
  for (let i = 0; i < 3; i++)
    await frames.nth(i).locator('.pn-screen').waitFor();
});
await check('drive ScreenHost', 'guides/marketing-hub/', async (p) => {
  const root = '[data-demo="screen-host"]';
  await p.locator(`${root} [data-action="pinned"]`).click();
  await expectText(logOf(p, root), /"filter":"pinned"/);
  await p.locator(`${root} .pn-note`).first().click();
  await expectText(logOf(p, root), /screen: editor/);
  await p.locator(`${root} [data-action="go"]`).click();
  await expectText(logOf(p, root), /screen: focus/);
});
await check(
  'render a frame with the embed API',
  'guides/marketing-hub/',
  async (p) => {
    const root = '[data-demo="embed"]';
    await p.locator(`${root} md-slider`).evaluate((s) => {
      s.value = 450;
      s.dispatchEvent(new Event('input'));
    });
    await expectText(logOf(p, root), /frame 450[\s\S]*"elapsed":15/);
    await p.locator(`${root} .pn-time`).filter({hasText: '00:45'}).waitFor();
  }
);
await check('filter the sample gallery', 'demos/marketing-hub/', async (p) => {
  await p.locator('mnw-screen-card').first().waitFor();
  await p
    .locator('mnw-marketing-shell md-filter-chip', {hasText: 'Focus'})
    .click();
  await p.waitForFunction(
    () => document.querySelectorAll('mnw-screen-card').length === 1
  );
});
await check(
  'compare on the prototype page',
  'demos/marketing-hub/screen.html?id=focus',
  async (p) => {
    await p
      .locator('mnw-screen-inspector md-outlined-segmented-button', {
        hasText: 'Compare',
      })
      .click();
    await p.waitForFunction(
      () =>
        document.querySelectorAll('.mnw-compare__col .pn-screen').length === 2
    );
    if (!/mode=compare/.test(p.url()))
      throw new Error('the URL does not keep the view');
  }
);
await check('skip link and keyboard focus', '', async (p) => {
  await p.keyboard.press('Tab');
  const first = await p.evaluate(() => document.activeElement?.className);
  if (first !== 'skip-link')
    throw new Error(`the first Tab stop is "${first}"`);
  await p.keyboard.press('Enter');
  const focused = await p.evaluate(() => document.activeElement?.id);
  if (focused !== 'main-content')
    throw new Error(`Enter on the skip link focused "${focused}"`);
});
await ctx.close();

await browser.close();
server.close();

const pages = [...visited.keys()].length;
if (problems.length) {
  console.error(`Checked ${pages} pages: ${problems.length} problem(s)`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `Checked ${pages} pages, ${anchorChecks.length} anchor links, navigation (${clickThrough.join(' → ')}, Back, Forward, refresh), 360px layouts and ${interactions.length} demos: no problems.`
);
