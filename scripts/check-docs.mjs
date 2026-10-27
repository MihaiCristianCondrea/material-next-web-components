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
    // A request a reload or navigation cancels is aborted, not missing; a
    // missing file still fails above with its 404.
    const aborted = r.failure()?.errorText === 'net::ERR_ABORTED';
    if (r.url().startsWith(origin) && !aborted) {
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
      // <base href> sets where the page's URLs resolve; it is not a link.
      const href = el.localName === 'base' ? null : el.getAttribute('href');
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
const check = async (name, path, run, on = demo) => {
  current = path;
  try {
    await on.goto(`${base}${path}`, {waitUntil: 'networkidle'});
    await settle(on);
    await run(on);
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
const launcherTitles = (p, launcher) =>
  p
    .locator(`${launcher} .grid--favorites .title`)
    .allTextContents()
    .then((titles) => titles.map((t) => t.trim()));
await check(
  'edit and persist launcher favorites',
  'examples/product-launcher/',
  async (p) => {
    const launcher = '#projects-launcher';
    await p.evaluate(() => localStorage.clear());
    await p.locator(`${launcher} .trigger`).click();
    await p.locator(`${launcher} .panel`).waitFor({state: 'visible'});
    const before = await launcherTitles(p, launcher);
    if (
      before.some((title) =>
        ['Tutorials admin', 'Codex', 'Smart Cleaner'].includes(title)
      )
    )
      throw new Error('a removed product is still offered');
    if (before.includes('Material Next') || before.length !== 3)
      throw new Error(`the current product shows: ${before.join(', ')}`);
    await p.locator(`${launcher} .edit`).click();
    const editing = p.locator(`${launcher} .tile--editing`).first();
    await p.locator(`${launcher} .grid--favorites .cell`).first().hover();
    const wobble = await editing.evaluate((tile) => {
      const style = getComputedStyle(tile);
      return [style.animationIterationCount, style.animationPlayState];
    });
    if (wobble[0] !== 'infinite' || wobble[1] !== 'running')
      throw new Error(`edit motion stops: ${wobble}`);
    await p.locator(`${launcher} .tile--editing`).nth(1).focus();
    await p.keyboard.press('Alt+ArrowLeft');
    await expectText(
      logOf(p),
      /launcher-change .*"shortcut:github".*"console:tutorials-admin"/
    );
    await p.locator(`${launcher} .tile--add`).first().click();
    await expectText(logOf(p), /console:play-console"\]/);
    await p.reload({waitUntil: 'networkidle'});
    await settle(p);
    await p.locator(`${launcher} .trigger`).click();
    const after = await launcherTitles(p, launcher);
    if (after[0] !== 'GitHub profile' || after.at(-1) !== 'Play Console')
      throw new Error(`favorites did not persist: ${after.join(', ')}`);
    const stored = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('mnw-docs-demo:launcher'))
    );
    // Material Next is hidden here but keeps its slot in the stored list.
    if (!stored.favoriteIds.includes('web:material-next'))
      throw new Error('the hidden favorite was dropped');
    await p.keyboard.press('Escape');
    const focused = await p.evaluate(
      () => document.activeElement?.id === 'projects-launcher'
    );
    if (!focused) throw new Error('Escape did not return focus to the button');
    // Drag with the pointer: the last favorite to the front.
    await p.locator(`${launcher} .trigger`).click();
    await p.locator(`${launcher} .edit`).click();
    const tiles = p.locator(`${launcher} .tile--editing`);
    const from = await tiles.last().boundingBox();
    const to = await tiles.first().boundingBox();
    await p.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await p.mouse.down();
    await p.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {steps: 8});
    await p.mouse.up();
    const dragged = await launcherTitles(p, launcher);
    if (dragged[0] !== 'Play Console')
      throw new Error(`dragging did not reorder: ${dragged.join(', ')}`);
    await p.locator(`${launcher} .reset`).click();
    const reset = await launcherTitles(p, launcher);
    if (reset.join() !== before.join())
      throw new Error(`reset gave ${reset.join(', ')}`);
  }
);
await check('the app bar launcher loads its icons', '', async (p) => {
  const launcher = '.site-actions mnw-product-launcher';
  await p.locator(`${launcher} .trigger`).click();
  await p.locator(`${launcher} .panel`).waitFor({state: 'visible'});
  await p.waitForFunction(() =>
    [
      ...document
        .querySelector('.site-actions mnw-product-launcher')
        .shadowRoot.querySelectorAll('img'),
    ].every((img) => img.complete && img.naturalWidth > 0)
  );
  await p.locator(`${launcher} .panel`).evaluate(async (panel) => {
    await Promise.all(
      panel.getAnimations().map((animation) => animation.finished)
    );
  });
  const icon = p.locator(`${launcher} .grid--favorites .icon`).first();
  const beforeHover = await icon.boundingBox();
  await p.locator(`${launcher} .grid--favorites .tile`).first().hover();
  const afterHover = await icon.boundingBox();
  if (
    Math.abs(beforeHover.width - afterHover.width) > 0.5 ||
    Math.abs(beforeHover.height - afterHover.height) > 0.5
  )
    throw new Error('hover resizes launcher artwork');
  await p.mouse.click(10, 500);
  const open = await p.locator(launcher).getAttribute('open');
  if (open !== null) throw new Error('a click outside did not close it');
});
await check(
  'route the app shell demo and guard unsaved changes',
  'demos/app-shell/feed/',
  async (p) => {
    const shell = p.locator('mnw-app-shell');
    const heading = () => shell.evaluate((el) => el.heading);
    if ((await shell.getAttribute('layout')) !== 'permanent')
      throw new Error('no permanent drawer at 1280px');
    // A marker on window survives client-side navigation, not a reload.
    await p.evaluate(() => (window.__sameDocument = true));
    await p.locator('mnw-navigation-item[href="lessons/"]').click();
    if ((await heading()) !== 'Lessons' || !p.url().endsWith('/lessons/'))
      throw new Error(`Lessons did not open: ${await heading()} ${p.url()}`);
    const active = await p
      .locator('mnw-navigation-item[active]')
      .getAttribute('href');
    if (active !== 'lessons/') throw new Error(`${active} is current`);
    await p.locator('#lesson').fill('Draft');
    await p.locator('mnw-navigation-item[href="settings/"]').click();
    await p.locator('#leave-dialog').waitFor({state: 'visible'});
    await p.locator('#leave-dialog md-text-button').click();
    if ((await heading()) !== 'Lessons')
      throw new Error('Keep editing left the lesson');
    await p.locator('mnw-navigation-item[href="settings/"]').click();
    await p.locator('#leave-dialog md-filled-tonal-button').click();
    await p.waitForFunction(
      () => document.querySelector('mnw-app-shell').heading === 'Settings'
    );
    if (!(await p.evaluate(() => window.__sameDocument)))
      throw new Error('navigating reloaded the page');
    await p.goBack();
    await p.waitForFunction(
      () => document.querySelector('mnw-app-shell').heading === 'Lessons'
    );
  }
);
await check(
  'switch the app shell presentation without losing state',
  'examples/app-shell/',
  async (p) => {
    const frame = p.frame({url: /demos\/app-shell\//});
    if (!frame) throw new Error('no console frame');
    await frame.waitForSelector('mnw-app-shell[layout]');
    await p.locator('.app-shell-stage').scrollIntoViewIfNeeded();
    const shell = frame.locator('mnw-app-shell');
    const layout = () => shell.getAttribute('layout');
    const until = async (want) => {
      for (let i = 0; i < 40 && (await layout()) !== want; i++) {
        await p.waitForTimeout(50);
      }
      if ((await layout()) !== want)
        throw new Error(`layout is ${await layout()}, not ${want}`);
    };
    // The frame is scaled with CSS zoom, which Playwright's own clicks inside
    // it do not follow: click where the element is on screen, as a user does.
    const tap = async (selector, offset = {x: 0.5, y: 0.5}) => {
      const outer = await p.locator('.app-shell-frame').evaluate((f) => ({
        ...f.getBoundingClientRect().toJSON(),
        zoom: Number(f.style.zoom) || 1,
      }));
      const inner = await frame
        .locator(selector)
        .first()
        .evaluate((e) => e.getBoundingClientRect().toJSON());
      await p.mouse.click(
        outer.x + (inner.x + inner.width * offset.x) * outer.zoom,
        outer.y + (inner.y + inner.height * offset.y) * outer.zoom
      );
    };
    const drawerShown = () =>
      frame.evaluate(() =>
        document
          .querySelector('mnw-app-shell')
          .shadowRoot.querySelector('.drawer')
          .matches(':popover-open')
      );
    const menuFocused = () =>
      shell.evaluate((el) =>
        el.shadowRoot.activeElement?.classList.contains('leading')
      );

    await until('permanent');
    await tap('mnw-navigation-item[href="lessons/"]');
    await frame.waitForFunction(
      () => document.querySelector('mnw-app-shell').heading === 'Lessons'
    );
    await frame.locator('#lesson').evaluate((field) => {
      field.value = 'Draft';
      field.dispatchEvent(new Event('input', {bubbles: true}));
    });
    const url = frame.url();
    // Mark the navigation nodes: a switch must keep these very elements.
    await frame.evaluate(() =>
      document
        .querySelectorAll('mnw-navigation-item')
        .forEach((node, i) => (node.__mark = i))
    );
    const kept = async (when) => {
      const now = await frame.evaluate(() => ({
        text: document.querySelector('#lesson')?.value,
        heading: document.querySelector('mnw-app-shell').heading,
        marked: [...document.querySelectorAll('mnw-navigation-item')].every(
          (node, i) => node.__mark === i
        ),
      }));
      if (
        now.text !== 'Draft' ||
        now.heading !== 'Lessons' ||
        !now.marked ||
        frame.url() !== url
      )
        throw new Error(`${when} lost state: ${JSON.stringify(now)}`);
    };

    await p.locator('[data-presentation="modal"]').click();
    await until('modal');
    await kept('switching to modal');
    // Full-width content: the screen starts at the frame's edge.
    const main = await frame
      .locator('mnw-app-shell .main')
      .evaluate((el) => el.getBoundingClientRect().toJSON());
    if (main.x > 1 || main.width < 1200)
      throw new Error(`content is at ${main.x}px, ${main.width}px wide`);
    // The same nodes in the modal drawer; Escape and the scrim close it.
    await tap('mnw-app-shell .leading');
    await frame.waitForFunction(() =>
      document
        .querySelector('mnw-app-shell')
        .shadowRoot.querySelector('.drawer')
        .matches(':popover-open')
    );
    await kept('opening the modal drawer');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(100);
    if (await drawerShown()) throw new Error('Escape did not close it');
    if (!(await menuFocused()))
      throw new Error('Escape did not return focus to the menu');
    await tap('mnw-app-shell .leading');
    await p.waitForTimeout(300);
    if (!(await drawerShown())) throw new Error('the menu did not reopen it');
    // The scrim: the right half of the screen, beside the drawer.
    await tap('mnw-app-shell', {x: 0.8, y: 0.2});
    await p.waitForTimeout(100);
    if (await drawerShown()) throw new Error('the scrim did not close it');

    await p.locator('[data-presentation="auto"]').click();
    await until('permanent');
    await kept('switching back');
    // A closed modal menu disappears when the permanent drawer returns.
    await p.locator('[data-presentation="modal"]').click();
    await until('modal');
    await frame.locator('mnw-app-shell .leading').focus();
    await frame.evaluate(() =>
      window.postMessage(
        {type: 'app-shell-presentation', mode: 'auto'},
        location.origin
      )
    );
    await until('permanent');
    const currentFocused = await frame.evaluate(
      () =>
        document.activeElement ===
        document.querySelector('mnw-navigation-item[active]')
    );
    if (!currentFocused)
      throw new Error('menu focus was lost when the permanent drawer returned');
    // Focus on a destination when the drawer is put away goes to the menu.
    await frame.evaluate(() => {
      document.querySelector('mnw-navigation-item[href="feed/"]').focus();
      window.postMessage(
        {type: 'app-shell-presentation', mode: 'modal'},
        location.origin
      );
    });
    await until('modal');
    await p.waitForTimeout(100);
    if (!(await menuFocused()))
      throw new Error('focus fell out of the drawer on switch');
    await p.locator('[data-presentation="auto"]').click();
    await until('permanent');

    // Resizing across the breakpoint, in the connected presentation.
    await p.locator('[data-width="390"]').click();
    await until('modal');
    await p.locator('[data-width="1280"]').click();
    await until('permanent');
    await kept('resizing');
  }
);
await check(
  'open a deep app shell route and go back up',
  'demos/app-shell/feed/android-16/',
  async (p) => {
    const shell = p.locator('mnw-app-shell');
    if ((await shell.evaluate((el) => el.leading)) !== 'back')
      throw new Error('an article does not lead with Back');
    const active = await p
      .locator('mnw-navigation-item[active]')
      .getAttribute('href');
    if (active !== 'feed/') throw new Error(`${active} is current`);
    await p.locator('mnw-app-shell .leading').click();
    await p.waitForFunction(
      () => document.querySelector('mnw-app-shell').heading === 'Feed'
    );
  }
);

// Phone layouts: the fixes for cramped navigation, tall table rows and
// off-centre catalog icons, and the launcher as a bottom sheet.

await check(
  'the selection pill follows routes, history and resize',
  '',
  async (p) => {
    const matches = () =>
      p.evaluate(() => {
        const indicator = document
          .querySelector('.site-tab-indicator')
          .getBoundingClientRect();
        const selected = document
          .querySelector('.site-tab-link[aria-current="page"]')
          .getBoundingClientRect();
        return (
          Math.abs(indicator.left - selected.left) < 1 &&
          Math.abs(indicator.width - selected.width) < 1
        );
      });
    await p.locator('.site-tab-link', {hasText: 'Install'}).click();
    await p.waitForURL('**/install/');
    await p.waitForTimeout(400);
    if (!(await matches())) throw new Error('pill missed Install');
    await p.goBack();
    await p.waitForURL(base);
    await p.waitForTimeout(400);
    if (!(await matches())) throw new Error('pill missed Home on Back');
    await p.setViewportSize({width: 360, height: 780});
    await p.waitForTimeout(100);
    if (!(await matches())) throw new Error('pill missed after resize');
    await p.setViewportSize({width: 1280, height: 900});
  }
);
await check(
  'the inspector controls share sans-serif typography',
  'examples/screen-inspector/',
  async (p) => {
    const fonts = await p.locator('mnw-screen-inspector').evaluate((host) => {
      const root = host.shadowRoot;
      const segment = root.querySelector('md-outlined-segmented-button');
      const select = root.querySelector('md-outlined-select');
      const label = segment.shadowRoot.querySelector(
        '.md3-segmented-button__label-text'
      );
      return [host, label, select].map(
        (node) => getComputedStyle(node).fontFamily
      );
    });
    if (
      fonts.some((font) => !font.includes('sans-serif') || /Times/.test(font))
    )
      throw new Error(`unexpected fonts: ${fonts}`);
  }
);
await check(
  'the marketing gallery has a clean app bar and no hero',
  'demos/marketing-hub/',
  async (p) => {
    const shell = p.locator('mnw-marketing-shell');
    if (await shell.locator('.hero, mnw-play-badge, mnw-github-badge').count())
      throw new Error('promotional hero or badge still rendered');
    if (!(await shell.locator('#catalog h1').count()))
      throw new Error('missing catalog page heading');
  }
);
await check(
  'expressive tabs are fully rounded',
  'examples/expressive-tab-bar/',
  async (p) => {
    const shapes = await p
      .locator('mnw-expressive-tab-bar')
      .first()
      .evaluate((host) => {
        const root = host.shadowRoot;
        return [
          root.querySelector('nav'),
          root.querySelector('md-primary-tab'),
        ].map((node) => getComputedStyle(node).borderTopLeftRadius);
      });
    if (shapes.some((shape) => shape !== '999px'))
      throw new Error(`tab shapes: ${shapes}`);
  }
);
const reduced = await browser.newPage({reducedMotion: 'reduce'});
await check(
  'reduced motion disables launcher wobble and nav motion',
  '',
  async (p) => {
    const launcher = '.site-actions mnw-product-launcher';
    await p.locator(`${launcher} .trigger`).click();
    await p.locator(`${launcher} .edit`).click();
    const animations = await p
      .locator(`${launcher} .tile--editing`)
      .first()
      .evaluate((tile) => tile.getAnimations().length);
    if (animations)
      throw new Error('favorite still wobbles under reduced motion');
    await p.keyboard.press('Escape');
    await p.locator('.site-tab-link', {hasText: 'Install'}).click();
    await p.waitForURL('**/install/');
    const moving = await p
      .locator('.site-tab-indicator')
      .evaluate((pill) => pill.getAnimations().length);
    if (moving)
      throw new Error('selection pill still animates under reduced motion');
  },
  reduced
);
await reduced.close();
await ctx.close();

const phoneContext = await browser.newContext({
  viewport: {width: 360, height: 780},
  hasTouch: true,
});
const handset = await phoneContext.newPage();
watch(handset, () => `phone ${current}`);
await check(
  'the active tab and its pill stay in view',
  'roadmap/',
  async (p) => {
    const {pill, link} = await p.evaluate(() => {
      const box = (e) => e.getBoundingClientRect().toJSON();
      const nav = document.querySelector('.site-nav');
      return {
        pill: box(nav),
        link: box(nav.querySelector('[aria-current="page"]')),
      };
    });
    if (link.left < 0 || link.right > 360)
      throw new Error(
        `the Roadmap tab is off screen (${link.left}..${link.right})`
      );
    if (link.left < pill.left || link.right > pill.right)
      throw new Error('the active tab sits outside the nav pill');
  },
  handset
);
await check(
  'tables stack into labelled rows',
  'roadmap/',
  async (p) => {
    const rows = await p.evaluate(() =>
      [...document.querySelectorAll('.prose tbody tr')].map((tr) => ({
        height: tr.getBoundingClientRect().height,
        labelled: [...tr.cells].every((td) => td.dataset.label),
      }))
    );
    if (!rows.length) throw new Error('no table');
    if (rows.some((r) => !r.labelled)) throw new Error('a cell has no label');
    const tallest = Math.max(...rows.map((r) => r.height));
    if (tallest > 360) throw new Error(`a row is ${tallest}px tall`);
  },
  handset
);
await check(
  'catalog icons sit centred in their tiles',
  'examples/',
  async (p) => {
    const off = await p.evaluate(() =>
      [...document.querySelectorAll('.catalog-card__icon')].map((tile) => {
        const range = document.createRange();
        range.selectNodeContents(tile);
        const glyph = range.getBoundingClientRect();
        const box = tile.getBoundingClientRect();
        return Math.abs(
          glyph.left + glyph.width / 2 - (box.left + box.width / 2)
        );
      })
    );
    if (off.some((d) => d > 2))
      throw new Error(`an icon is ${Math.max(...off).toFixed(1)}px off centre`);
  },
  handset
);
await check(
  'the launcher is a bottom sheet on phones',
  'examples/product-launcher/',
  async (p) => {
    const launcher = '.site-actions mnw-product-launcher';
    await p.locator(`${launcher} .trigger`).tap();
    const panel = p.locator(`${launcher} .panel`);
    await panel.waitFor({state: 'visible'});
    // After the sheet's entrance animation.
    await p.waitForTimeout(400);
    const box = await panel.boundingBox();
    if (Math.round(box.width) !== 360 || Math.round(box.y + box.height) !== 780)
      throw new Error(`the sheet is at ${JSON.stringify(box)}`);
    await p.locator(`${launcher} .close`).tap();
    await panel.waitFor({state: 'hidden'});
  },
  handset
);
await check(
  'the app shell drawer is modal on phones',
  'demos/app-shell/feed/',
  async (p) => {
    const shell = p.locator('mnw-app-shell');
    if ((await shell.getAttribute('layout')) !== 'modal')
      throw new Error('no modal drawer at 360px');
    const drawer = p.locator('mnw-app-shell .drawer');
    await p.locator('mnw-app-shell .leading').tap();
    await drawer.waitFor({state: 'visible'});
    await p.waitForTimeout(400);
    const box = await drawer.boundingBox();
    if (box.x !== 0 || box.width > 360 - 56)
      throw new Error(`the drawer is at ${JSON.stringify(box)}`);
    // The scrim, beside the drawer.
    await p.mouse.click(340, 400);
    await drawer.waitFor({state: 'hidden'});
    await p.locator('mnw-app-shell .leading').tap();
    await drawer.waitFor({state: 'visible'});
    await p.keyboard.press('Escape');
    await drawer.waitFor({state: 'hidden'});
    const focused = await shell.evaluate((el) =>
      el.shadowRoot.activeElement?.classList.contains('leading')
    );
    if (!focused) throw new Error('Escape did not return focus to the menu');
    await p.locator('mnw-app-shell .leading').tap();
    await p.locator('mnw-navigation-item[href="studio-bot/"]').tap();
    await drawer.waitFor({state: 'hidden'});
    if ((await shell.evaluate((el) => el.heading)) !== 'Studio Bot')
      throw new Error('picking a destination did not navigate');
  },
  handset
);
await phoneContext.close();

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
