/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture, oneEvent} from '@open-wc/testing';
import {html} from 'lit';
import {
  ScreenHost,
  configureMarketingAssets,
  createPreviewSettingsStore,
  createScreenRegistry,
  parsePrototypeView,
  prototypeHref,
  resolvePalette,
  sanitizeSettings,
  shellLayout,
  mountMarketingHub,
  writePrototypeView,
  DEFAULT_PREVIEW_SETTINGS,
  DEFAULT_PROTOTYPE_VIEW,
  type MarketingScreen,
  type MaterialNextMarketingShell,
  type MaterialNextScreenCard,
  type MaterialNextMarketingTopAppBar,
} from '../marketing/index.js';

// The test server serves the repository root, where the shipped assets live.
configureMarketingAssets({base: '/assets/marketing/'});

const screen = (
  id: string,
  extra: Partial<MarketingScreen> = {}
): MarketingScreen => ({
  id,
  title: id,
  description: `${id} screen`,
  defaults: {count: 0},
  render: (state) =>
    html`<div
      class="sc-screen"
      data-count=${String(state.count)}
      data-nav=${state.navType}
    ></div>`,
  ...extra,
});

const memoryStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
};

suite('marketing domain', () => {
  test('sanitizeSettings keeps known values and drops the rest', () => {
    const s = sanitizeSettings(
      {theme: 'dark', navType: 'sideways', palette: 'gone', deviceFrame: true},
      {palettes: ['android']}
    );
    assert.deepEqual(s, {
      ...DEFAULT_PREVIEW_SETTINGS,
      theme: 'dark',
      deviceFrame: true,
    });
  });

  test('resolvePalette uses the screen palette only for "captured"', () => {
    assert.equal(resolvePalette('captured', 'android'), 'android');
    assert.equal(resolvePalette('blue', 'android'), 'blue');
  });

  test('shellLayout follows App Toolkit breakpoints', () => {
    assert.equal(shellLayout('phone').mode, 'bottomBar');
    assert.equal(shellLayout('fold').mode, 'expandedRail');
    assert.equal(shellLayout('fold').navWidth, 96);
    assert.equal(shellLayout('desktop').mode, 'permanentDrawer');
    assert.equal(shellLayout('desktop').statusBar, 0);
  });

  test('registry rejects duplicate ids and lists categories in order', () => {
    assert.throws(() => createScreenRegistry([screen('a'), screen('a')]));
    const r = createScreenRegistry([
      screen('a', {category: 'feed', categoryLabel: 'Feed'}),
      screen('b', {category: 'ai'}),
      screen('c', {category: 'feed'}),
    ]);
    assert.deepEqual(r.categories(), [
      {id: 'feed', label: 'Feed'},
      {id: 'ai', label: 'ai'},
    ]);
    assert.equal(r.byId('b')?.id, 'b');
    assert.isUndefined(r.byId(null));
  });
});

suite('marketing data', () => {
  test('settings store round-trips per product and survives bad JSON', () => {
    const storage = memoryStorage();
    const a = createPreviewSettingsStore({
      productId: 'a',
      palettes: ['blue'],
      storage,
    });
    a.save({...DEFAULT_PREVIEW_SETTINGS, palette: 'blue'});
    assert.equal(a.load().palette, 'blue');
    const b = createPreviewSettingsStore({
      productId: 'b',
      palettes: ['blue'],
      storage,
    });
    assert.equal(b.load().palette, 'captured');
    storage.setItem('mnw-marketing:b:preview', '{nope');
    assert.equal(b.load().palette, 'captured');
  });

  test('prototype view survives a URL round trip', () => {
    const view = {
      ...DEFAULT_PROTOTYPE_VIEW,
      id: 'feed',
      mode: 'compare' as const,
      compare: 'palette' as const,
      palette: 'blue',
      paletteB: 'green',
      window: 'fold' as const,
      deviceFrame: true,
    };
    const url = writePrototypeView(
      new URL('https://hub.test/screen.html'),
      view
    );
    const parsed = parsePrototypeView(url.searchParams, {
      palettes: ['blue', 'green'],
    });
    assert.include(parsed, {
      id: 'feed',
      mode: 'compare',
      compare: 'palette',
      palette: 'blue',
      paletteB: 'green',
      window: 'fold',
      deviceFrame: true,
      capture: false,
    });
  });

  test('panel=none is capture mode, framed or not', () => {
    const p = (q: string) =>
      parsePrototypeView(new URLSearchParams(q), {palettes: []});
    assert.isTrue(p('frame=none&panel=none').capture);
    assert.isTrue(p('frame=device&panel=none').deviceFrame);
    assert.isFalse(p('frame=none').capture);
    assert.deepEqual(p('state={broken').state, {});
  });

  test('prototypeHref writes only non-default choices', () => {
    const href = new URL(
      prototypeHref('https://hub.test/screen.html', 'feed', {
        theme: 'system',
        navType: 'buttons',
      })
    );
    assert.equal(href.searchParams.get('nav'), 'buttons');
    assert.isFalse(href.searchParams.has('theme'));
    assert.isFalse(href.searchParams.has('frame'));
  });
});

suite('ScreenHost', () => {
  test('renders state, applies palette and theme, and frames on request', async () => {
    const registry = createScreenRegistry([
      screen('feed', {palette: 'android'}),
    ]);
    const el = await fixture<HTMLDivElement>(html`<div></div>`);
    const host = new ScreenHost(el, {
      registry,
      id: 'feed',
      theme: 'dark',
      fill: true,
    });
    assert.equal(el.dataset.palette, 'android');
    assert.equal(el.dataset.theme, 'dark');
    assert.isTrue(el.classList.contains('mnw-mount--fill'));
    host.set({count: 3});
    assert.equal(
      el.querySelector('.sc-screen')?.getAttribute('data-count'),
      '3'
    );
    host.setOptions({frame: true, navType: 'buttons'});
    const frame = el.querySelector('mnw-device-frame');
    assert.equal(frame?.getAttribute('device'), 'pixel_9_pro_xl');
    assert.equal(
      frame?.querySelector('.sc-screen')?.getAttribute('data-nav'),
      'buttons'
    );
    assert.isFalse(el.classList.contains('mnw-mount--fill'));
    host.destroy();
  });

  test('go() goes through onGo, or loads the target itself', async () => {
    const registry = createScreenRegistry([screen('a'), screen('b')]);
    const el = await fixture<HTMLDivElement>(html`<div></div>`);
    const visited: string[] = [];
    const host = new ScreenHost(el, {
      registry,
      id: 'a',
      onGo: (id) => visited.push(id),
    });
    host.go('b');
    assert.deepEqual(visited, ['b']);
    const self = new ScreenHost(document.createElement('div'), {
      registry,
      id: 'a',
    });
    self.go('b', {count: 2});
    assert.equal(self.screen?.id, 'b');
    assert.equal(self.state.count, 2);
    assert.throws(() => self.load('missing'));
  });
});

suite('screen frame defaults', () => {
  test('details default to a frame, explicit frameless links and bare captures stay frameless', () => {
    assert.isTrue(
      parsePrototypeView(new URLSearchParams('id=a'), {palettes: []})
        .deviceFrame
    );
    assert.isFalse(
      parsePrototypeView(new URLSearchParams('id=a&frame=none'), {palettes: []})
        .deviceFrame
    );
    assert.isFalse(
      parsePrototypeView(new URLSearchParams('id=a&panel=none'), {palettes: []})
        .deviceFrame
    );
  });
});

suite('marketing elements', () => {
  test('shell keeps its app bar clean and has no footer', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{
          id: 'demo',
          name: 'Demo',
          icon: '',
        }}
        ><div>card</div></mnw-marketing-shell
      >`
    );
    const root = el.shadowRoot!;
    assert.notExists(root.querySelector('.hero'));
    assert.notExists(root.querySelector('mnw-play-badge, mnw-github-badge'));
    assert.notExists(root.querySelector('mnw-site-footer, footer'));
    assert.notExists(
      root.querySelector('.catalog-header, md-chip-set, .count')
    );
    assert.exists(root.querySelector('.grid slot'));
  });

  test('navigation-mode="none" has no drawer and no menu button', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        navigation-mode="none"
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
      ></mnw-marketing-shell>`
    );
    const shell = el.shadowRoot!.querySelector('mnw-app-shell')!;
    await shell.updateComplete;
    assert.notExists(shell.shadowRoot!.querySelector('.leading'));
    assert.equal(
      getComputedStyle(shell.shadowRoot!.querySelector('.drawer')!).display,
      'none'
    );
    shell.openDrawer();
    await shell.updateComplete;
    assert.isFalse(shell.drawerOpen);
  });

  test('shell shows a fallback when no cards are supplied', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
      ></mnw-marketing-shell>`
    );
    const root = el.shadowRoot!;
    assert.notExists(root.querySelector('mnw-play-badge'));
    assert.exists(root.querySelector('.empty'));
  });

  test('marketing drawer starts closed even at desktop width', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        style="width: 1280px"
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
      ></mnw-marketing-shell>`
    );
    const shell = el.shadowRoot!.querySelector('mnw-app-shell')!;
    await shell.updateComplete;
    assert.equal(el.navigationMode, 'modal');
    assert.equal(shell.layout, 'modal');
    assert.isFalse(shell.drawerOpen);
  });

  test('marketing shell switches drawer presentation without replacing cards', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
        navigation-mode="permanent"
      >
        <div id="kept">Screen state</div></mnw-marketing-shell
      >`
    );
    const shell = el.shadowRoot!.querySelector('mnw-app-shell')!;
    await shell.updateComplete;
    assert.equal(shell.layout, 'permanent');
    const card = el.querySelector('#kept');
    el.navigationMode = 'modal';
    await el.updateComplete;
    await shell.updateComplete;
    assert.equal(shell.layout, 'modal');
    assert.isTrue(el.shadowRoot!.querySelector('mnw-app-shell') === shell);
    assert.isTrue(el.querySelector('#kept') === card);
    assert.isTrue(card!.isConnected);
  });

  test('marketing theme footer reports settings changes', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
      ></mnw-marketing-shell>`
    );
    const changed = oneEvent(el, 'settings-change');
    el.shadowRoot!.querySelector('mnw-app-shell-footer')!.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: {theme: 'dark'},
        bubbles: true,
        composed: true,
      })
    );
    assert.equal((await changed).detail.theme, 'dark');
  });

  test('standalone marketing bar contains identity only', async () => {
    const el = await fixture<MaterialNextMarketingTopAppBar>(
      html`<mnw-marketing-top-app-bar name="Demo"></mnw-marketing-top-app-bar>`
    );
    assert.notExists(
      el.shadowRoot!.querySelector('slot, .context, mnw-github-badge')
    );
    assert.notInclude(el.shadowRoot!.textContent!, 'UI kit');
  });

  test('shell forwards actions to the app shell top app bar', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell .product=${{id: 'demo', name: 'Demo', icon: ''}}
        ><button slot="actions" id="get">Get</button></mnw-marketing-shell
      >`
    );
    const forwarded = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'slot[name="actions"]'
    )!;
    assert.equal(forwarded.slot, 'actions');
    assert.equal(forwarded.assignedElements()[0]?.id, 'get');
    const shell = el.shadowRoot!.querySelector('mnw-app-shell')!;
    await shell.updateComplete;
    const bar = shell.shadowRoot!.querySelector<HTMLSlotElement>(
      '.bar slot[name="actions"]'
    )!;
    assert.deepEqual(
      bar.assignedElements({flatten: true}).map((e) => e.id || e.className),
      ['settings', 'get'],
      'the preview settings button comes first'
    );
  });

  test('shell opens preview settings from its top app bar', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
      ></mnw-marketing-shell>`
    );
    const root = el.shadowRoot!;
    assert.notExists(
      root.querySelector('.controls'),
      'no row above the catalog'
    );
    const trigger = root.querySelector<HTMLElement>('.settings-trigger')!;
    assert.equal(trigger.getAttribute('aria-label'), 'Preview settings');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    trigger.click();
    await el.updateComplete;
    assert.isTrue(el.settingsOpen);
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    const controls = root.querySelector('.panel mnw-preview-controls')!;
    assert.equal(controls.getAttribute('layout'), 'stacked');
    setTimeout(() =>
      controls.dispatchEvent(
        new CustomEvent('settings-change', {
          detail: {theme: 'dark'},
          bubbles: true,
          composed: true,
        })
      )
    );
    await oneEvent(el, 'settings-change');
    root
      .querySelector('.settings-popover')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
      );
    await el.updateComplete;
    assert.isFalse(el.settingsOpen);
  });

  test('screen card reports its per-card toggles', async () => {
    const el = await fixture<MaterialNextScreenCard>(
      html`<mnw-screen-card
        heading="Feed"
        href="screen.html?id=feed"
      ></mnw-screen-card>`
    );
    const toggle = el.shadowRoot!.querySelector(
      'md-icon-button'
    )! as HTMLElement & {selected: boolean};
    setTimeout(() => {
      toggle.selected = true;
      toggle.dispatchEvent(new Event('change', {bubbles: true}));
    });
    const e = (await oneEvent(el, 'card-theme-toggle')) as CustomEvent<{
      selected: boolean;
    }>;
    assert.isTrue(e.detail.selected);
  });
});

/** Resolves once `check()` holds; fails after `timeout` ms. */
const until = async (check: () => boolean, timeout = 3000) => {
  const end = performance.now() + timeout;
  while (!check()) {
    if (performance.now() > end) throw new Error(`Timed out: ${check}`);
    await new Promise((r) => setTimeout(r, 16));
  }
};

suite('marketing hub', () => {
  test('opens a screen and returns to the gallery without a page load', async () => {
    const start = location.href;
    const root = await fixture<HTMLDivElement>(html`<div></div>`);
    const hub = mountMarketingHub({
      product: {id: 'hub-test', name: 'Hub test', icon: ''},
      screens: [screen('a'), screen('b')],
      root,
      store: {load: () => DEFAULT_PREVIEW_SETTINGS, save: () => {}},
    });
    try {
      assert.equal(hub.page(), 'gallery');
      await new Promise((r) => requestAnimationFrame(r));
      assert.lengthOf(root.querySelectorAll('mnw-screen-card'), 2);
      const card = root.querySelector('mnw-screen-card')!;
      assert.include(card.getAttribute('href')!, `${location.pathname}?id=a`);

      hub.go(card.getAttribute('href')!);
      // The switch runs in a view transition's callback where the browser has
      // them, which a busy or headless browser can run several frames later.
      await until(() => hub.page() === 'prototype');
      assert.exists(root.querySelector('mnw-prototype-layout'));
      assert.notExists(root.querySelector('mnw-marketing-shell'));
      assert.equal(history.state?.mnwHubFrom, 'gallery');

      const back = new Promise((r) =>
        addEventListener('popstate', r, {once: true})
      );
      hub.go(location.pathname);
      await back;
      await until(() => hub.page() === 'gallery');
      assert.exists(root.querySelector('mnw-marketing-shell'));
    } finally {
      hub.destroy();
      history.replaceState(null, '', start);
    }
  });
});
