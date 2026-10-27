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
    assert.equal(href.searchParams.get('frame'), 'none');
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

suite('marketing elements', () => {
  test('shell keeps its app bar clean and product links in the footer', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{
          id: 'demo',
          name: 'Demo',
          icon: '',
          storeUrl: 'https://play.google.com/store/apps/details?id=demo',
          repositoryUrl: 'https://github.com/example/demo',
        }}
        .count=${1}
        ><div>card</div></mnw-marketing-shell
      >`
    );
    const root = el.shadowRoot!;
    assert.notExists(root.querySelector('.hero'));
    assert.notExists(root.querySelector('mnw-play-badge, mnw-github-badge'));
    assert.exists(root.querySelector('footer a[href*="play.google.com"]'));
    assert.exists(root.querySelector('footer a[href*="github.com"]'));
    assert.include(
      root.querySelector('footer')?.textContent ?? '',
      'trademarks of Google LLC'
    );
    assert.exists(root.querySelector('.grid slot'));
  });

  test('shell hides the store parts without a store URL and shows the empty state', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
        .count=${0}
      ></mnw-marketing-shell>`
    );
    const root = el.shadowRoot!;
    assert.notExists(root.querySelector('mnw-play-badge'));
    assert.notInclude(
      root.querySelector('footer')?.textContent ?? '',
      'trademarks'
    );
    assert.exists(root.querySelector('.empty'));
  });

  test('marketing shell switches drawer presentation without replacing cards', async () => {
    const el = await fixture<MaterialNextMarketingShell>(
      html`<mnw-marketing-shell
        .product=${{id: 'demo', name: 'Demo', icon: ''}}
        .count=${1}
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
