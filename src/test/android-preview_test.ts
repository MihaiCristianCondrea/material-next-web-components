/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture} from '@open-wc/testing';
import {html, render} from 'lit';
import {
  createMarketingEmbed,
  ScreenHost,
  definePreviewApp,
  previewChrome,
  previewScreen,
  type MarketingScreen,
  type MaterialNextAndroidScreen,
  type PreviewScreenState,
} from '../marketing/index.js';

const APP = definePreviewApp({
  name: 'Sample',
  tabs: [
    {id: 'home', label: 'Home', icon: 'home'},
    {
      id: 'tools',
      label: 'Tools',
      icon: {name: 'grid_view', rounded: true},
      screen: 'tools-screen',
    },
  ],
  drawer: {
    entries: [{id: 'components', label: 'Components', icon: 'widgets'}],
    footer: [
      {id: 'settings', label: 'Settings', icon: 'settings'},
      {
        id: 'help',
        label: 'Help & feedback',
        icon: 'help_outline',
        screen: 'help-screen',
      },
    ],
  },
});
const NO_OVERFLOW = APP;
const WITH_OVERFLOW = definePreviewApp({
  ...APP.config,
  overflow: [{id: 'support', label: 'Support us', icon: 'favorite'}],
});

const win = (width: number) => ({width, height: 800, system: 'phone' as const});
const shadow = (el: Element) => el.shadowRoot!;
// Material Web moves `aria-label` from the host into its button once it upgrades.
const buttonByLabel = (el: Element, label: string) =>
  [...shadow(el).querySelectorAll<HTMLElement>('md-icon-button')].find(
    (b) => (b.ariaLabel ?? b.getAttribute('aria-label')) === label
  )!;
const labelText = (item: Element) =>
  item.querySelector('span:not(.badge)')!.textContent!.trim();
const until = async (check: () => boolean) => {
  for (let i = 0; i < 60 && !check(); i++)
    await new Promise((r) => setTimeout(r, 16));
  assert.isTrue(check());
};

suite('previewChrome', () => {
  test('layout boundaries pick the navigation the library does', () => {
    const at = (w: number) => previewChrome(APP, {window: win(w)});
    assert.equal(at(599).mode, 'bottomBar');
    assert.equal(at(600).mode, 'rail');
    assert.equal(at(839).mode, 'rail');
    assert.equal(at(840).mode, 'expandedRail');
    assert.equal(at(1199).mode, 'expandedRail');
    assert.equal(at(1200).mode, 'permanentDrawer');
  });

  test('the hamburger belongs to the bottom bar layout only', () => {
    assert.equal(previewChrome(APP, {window: win(430)}).navButton, 'menu');
    for (const w of [600, 840, 1200]) {
      assert.isNull(previewChrome(APP, {window: win(w)}).navButton, `at ${w}`);
    }
  });

  test('a child keeps the navigation bar; a page covers it; both show Back', () => {
    for (const w of [430, 600, 840, 1200]) {
      for (const kind of ['child', 'page'] as const) {
        const c = previewChrome(APP, {window: win(w), kind, tab: 'home'});
        assert.equal(c.navButton, 'back', `${kind} at ${w}`);
        assert.isNull(c.selectedTab, `${kind} marks no tab`);
      }
    }
    assert.equal(previewChrome(APP, {kind: 'child'}).bottomBar, 80);
    // Beside its list on a wide window, a child's tab stays marked.
    assert.equal(
      previewChrome(APP, {
        window: win(900),
        kind: 'child',
        tab: 'home',
        besideList: true,
      }).selectedTab,
      'home'
    );
    assert.isNull(
      previewChrome(APP, {
        window: win(430),
        kind: 'child',
        tab: 'home',
        besideList: true,
      }).selectedTab
    );
    assert.equal(previewChrome(APP, {kind: 'page'}).bottomBar, 0);
  });

  test('the app bar names the app until the navigation beside it does', () => {
    const source = (w: number, railExpanded = false) =>
      previewChrome(APP, {window: win(w), navigation: {railExpanded}})
        .titleSource;
    assert.equal(source(430), 'app');
    assert.equal(source(700), 'app');
    assert.equal(source(900), 'app');
    assert.equal(source(900, true), 'tab');
    assert.equal(source(1200), 'tab');
    assert.equal(
      previewChrome(APP, {kind: 'child'}).titleSource,
      'destination'
    );
  });

  test('the rail button expands, collapses, or is absent', () => {
    assert.equal(previewChrome(APP, {window: win(600)}).railButton, 'expand');
    assert.equal(previewChrome(APP, {window: win(840)}).railButton, 'expand');
    const open = previewChrome(APP, {
      window: win(840),
      navigation: {railExpanded: true},
    });
    assert.equal(open.railButton, 'collapse');
    assert.isTrue(open.navigationNamesApp);
    assert.isNull(previewChrome(APP, {window: win(1200)}).railButton);
    // Expansion belongs to the expanded rail layout; the rail layout opens a modal rail instead.
    assert.isFalse(
      previewChrome(APP, {window: win(600), navigation: {railExpanded: true}})
        .railExpanded
    );
  });

  test('navigation state only opens where the layout has it', () => {
    assert.isTrue(
      previewChrome(APP, {window: win(430), navigation: {drawerOpen: true}})
        .drawerOpen
    );
    assert.isFalse(
      previewChrome(APP, {window: win(840), navigation: {drawerOpen: true}})
        .drawerOpen
    );
    assert.isTrue(
      previewChrome(APP, {window: win(600), navigation: {railOpen: true}})
        .railOpen
    );
    assert.isFalse(
      previewChrome(APP, {window: win(430), navigation: {railOpen: true}})
        .railOpen
    );
  });

  test('no overflow entries, no overflow button', () => {
    assert.isFalse(previewChrome(NO_OVERFLOW).overflow);
    assert.isTrue(previewChrome(WITH_OVERFLOW).overflow);
    assert.isFalse(previewChrome(WITH_OVERFLOW, {kind: 'child'}).overflow);
    assert.isFalse(previewChrome(WITH_OVERFLOW, {kind: 'page'}).overflow);
  });

  test('insets: the bar on roots, the system navigation by type', () => {
    assert.equal(previewChrome(APP).bottomBar, 80);
    assert.equal(previewChrome(APP).systemNav, 24);
    assert.equal(previewChrome(APP, {navType: 'buttons'}).systemNav, 48);
    assert.equal(previewChrome(APP, {window: 'desktop'}).systemNav, 0);
  });

  test('duplicate ids are refused', () => {
    assert.throws(() =>
      definePreviewApp({
        name: 'x',
        tabs: [{id: 'a', label: 'A', icon: 'a'}],
        overflow: [{id: 'a', label: 'A', icon: 'a'}],
      })
    );
  });
});

suite('mnw-android-screen', () => {
  const screen = async (props: Partial<MaterialNextAndroidScreen> = {}) => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen .app=${APP} tab="home" interactive
        ><p id="content">Body</p>
        <div slot="overlay">
          <button id="inside">OK</button>
        </div></mnw-android-screen
      >`
    );
    Object.assign(el, props);
    await el.updateComplete;
    return el;
  };
  const buttonLabels = (el: Element) =>
    [...shadow(el).querySelectorAll<HTMLElement>('md-icon-button')].map(
      (b) => b.ariaLabel ?? b.getAttribute('aria-label')
    );

  test('phone: menu in the app bar, a navigation bar, no rail', async () => {
    const el = await screen();
    assert.include(buttonLabels(el), 'Open navigation drawer');
    assert.ok(shadow(el).querySelector('.navbar'));
    assert.notOk(shadow(el).querySelector('.rail'));
    assert.notInclude(buttonLabels(el), 'More options');
  });

  test('fold: the rail owns the control and the app bar has no hamburger', async () => {
    const el = await screen({window: 'fold'});
    assert.notInclude(buttonLabels(el), 'Open navigation drawer');
    assert.include(buttonLabels(el), 'Expand navigation');
    assert.notOk(shadow(el).querySelector('.navbar'));
  });

  test('desktop: a permanent drawer with the tabs and no navigation buttons', async () => {
    const el = await screen({window: 'desktop'});
    assert.notInclude(buttonLabels(el), 'Open navigation drawer');
    assert.notInclude(buttonLabels(el), 'Expand navigation');
    const items = [
      ...shadow(el).querySelectorAll('.drawer--permanent .drawer__item'),
    ].map(labelText);
    assert.deepEqual(items.slice(0, 2), ['Home', 'Tools']);
  });

  test('the rail button asks for the rail it controls', async () => {
    // 700 dp is the rail layout; the fold (852 dp) is already the expanded rail.
    const fold = await screen({window: win(700)});
    const events: unknown[] = [];
    fold.addEventListener('preview-navigation', (e) =>
      events.push((e as CustomEvent).detail.patch)
    );
    shadow(fold)
      .querySelector<HTMLElement>('.rail__header md-icon-button')!
      .click();
    assert.deepEqual(events, [{railOpen: true}]);
    const wide = await screen({window: win(1000)});
    wide.addEventListener('preview-navigation', (e) =>
      events.push((e as CustomEvent).detail.patch)
    );
    shadow(wide)
      .querySelector<HTMLElement>('.rail__header md-icon-button')!
      .click();
    assert.deepEqual(events[1], {railExpanded: true});
  });

  test('a child page shows Back and asks to go back', async () => {
    const el = await screen({kind: 'child', heading: 'Details'});
    let back = 0;
    el.addEventListener('preview-back', () => back++);
    assert.include(buttonLabels(el), 'Navigate up');
    buttonByLabel(el, 'Navigate up').click();
    assert.equal(back, 1);
    assert.equal(shadow(el).querySelector('.title')!.textContent, 'Details');
  });

  test('a child keeps the navigation bar with no tab marked; a page covers it', async () => {
    const child = await screen({kind: 'child', heading: 'Details'});
    const bar = shadow(child).querySelector('.navbar');
    assert.ok(bar);
    assert.equal(
      shadow(child).querySelectorAll('.navbar__item[aria-current]').length,
      0
    );
    const page = await screen({kind: 'page', heading: 'Settings'});
    assert.notOk(shadow(page).querySelector('.navbar'));
    assert.include(buttonLabels(page), 'Navigate up');
  });

  test('actions and the overflow menu sit side by side', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${WITH_OVERFLOW}
        tab="home"
        interactive
        .actions=${[{id: 'sort', icon: 'sort', label: 'Sort'}]}
      ></mnw-android-screen>`
    );
    await el.updateComplete;
    assert.includeMembers(buttonLabels(el), ['Sort', 'More options']);
  });

  test('the app bar names the app, or the tab beside a rail that names it', async () => {
    const title = (el: Element) =>
      shadow(el).querySelector('.title')!.textContent!.trim();
    assert.equal(title(await screen()), 'Sample');
    assert.equal(title(await screen({window: 'fold'})), 'Sample');
    assert.equal(
      title(await screen({window: 'fold', navigation: {railExpanded: true}})),
      'Home'
    );
    assert.equal(title(await screen({window: 'desktop'})), 'Home');
    assert.equal(title(await screen({heading: 'Custom'})), 'Custom');
  });

  test('without interactive nothing reacts: captures stay as rendered', async () => {
    const el = await screen({interactive: false});
    let events = 0;
    el.addEventListener('preview-navigation', () => events++);
    shadow(el).querySelector<HTMLElement>('md-icon-button')!.click();
    el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    assert.equal(events, 0);
  });

  test('the drawer makes the screen inert, Escape closes it, focus returns', async () => {
    const el = await screen();
    const menu = buttonByLabel(el, 'Open navigation drawer');
    menu.focus();
    el.navigation = {drawerOpen: true};
    await el.updateComplete;
    assert.isTrue(shadow(el).querySelector<HTMLElement>('.body')!.inert);
    assert.equal(
      shadow(el).activeElement,
      shadow(el).querySelector('.modal-drawer')
    );
    const patches: unknown[] = [];
    el.addEventListener('preview-navigation', (e) =>
      patches.push((e as CustomEvent).detail.patch)
    );
    el.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
    );
    assert.deepEqual(patches, [{drawerOpen: false, railOpen: false}]);
    el.navigation = {};
    await el.updateComplete;
    assert.isFalse(shadow(el).querySelector<HTMLElement>('.body')!.inert);
    await until(() => shadow(el).activeElement === menu);
  });

  test('drawer entries: preview-only ones say so and only close', async () => {
    const el = await screen({navigation: {drawerOpen: true}});
    const items = [
      ...shadow(el).querySelectorAll<HTMLElement>(
        '.modal-drawer .drawer__item'
      ),
    ];
    assert.deepEqual(items.map(labelText), [
      'Components',
      'Settings',
      'Help & feedback',
    ]);
    assert.equal(items[1].title, 'Not part of this preview');
    assert.isNull(items[2].getAttribute('data-preview-only'));
  });

  test('the overlay hosts its slot, closes on Escape and the scrim', async () => {
    const el = await screen({
      overlay: {presentation: 'sheet', label: 'Compass'},
    });
    const dialog = shadow(el).querySelector('[role="dialog"]')!;
    assert.equal(dialog.getAttribute('aria-label'), 'Compass');
    const slot = dialog.querySelector('slot') as HTMLSlotElement;
    assert.equal(
      slot.assignedElements()[0].querySelector('#inside')!.textContent,
      'OK'
    );
    let dismissed = 0;
    el.addEventListener('preview-dismiss', () => dismissed++);
    el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    shadow(el).querySelector<HTMLElement>('.scrim')!.click();
    assert.equal(dismissed, 2);
  });

  test('the overflow menu opens from its button and closes first on Escape', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${WITH_OVERFLOW}
        tab="home"
        interactive
      ></mnw-android-screen>`
    );
    const patches: unknown[] = [];
    el.addEventListener('preview-navigation', (e) =>
      patches.push((e as CustomEvent).detail.patch)
    );
    buttonByLabel(el, 'More options').click();
    el.navigation = {overflowOpen: true, drawerOpen: true};
    await el.updateComplete;
    el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    assert.deepEqual(patches, [{overflowOpen: true}, {overflowOpen: false}]);
  });
});

suite('previewScreen', () => {
  const host = document.createElement('div');
  document.body.append(host);

  test('wires navigation state, tabs and entries to the screen', async () => {
    const calls: unknown[] = [];
    const state = {
      navType: 'gesture',
      showAds: false,
      set: (p: unknown) => calls.push(['set', p]),
      go: (id: string, s: unknown) => calls.push(['go', id, s]),
    } as unknown as PreviewScreenState;
    render(
      previewScreen(APP, state, {tab: 'home', content: html`<p>x</p>`}),
      host
    );
    const el = host.querySelector('mnw-android-screen')!;
    await el.updateComplete;
    buttonByLabel(el, 'Open navigation drawer').click();
    shadow(el).querySelectorAll<HTMLElement>('.navbar__item')[1].click();
    assert.deepEqual(calls[0], ['set', {drawerOpen: true}]);
    assert.deepEqual(calls[calls.length - 1], ['go', 'tools-screen', {}]);
  });

  test('an expanded rail stays expanded on another destination', async () => {
    const calls: unknown[] = [];
    const state = {
      window: 'fold',
      railExpanded: true,
      set: () => {},
      go: (id: string, s: unknown) => calls.push([id, s]),
    } as unknown as PreviewScreenState;
    render(
      previewScreen(APP, state, {tab: 'home', content: html`<p>x</p>`}),
      host
    );
    const el = host.querySelector('mnw-android-screen')!;
    await el.updateComplete;
    shadow(el).querySelectorAll<HTMLElement>('.rail__item')[1].click();
    assert.deepEqual(calls, [['tools-screen', {railExpanded: true}]]);
  });

  test('tab switches do not replay the expanded rail label entrance', async () => {
    const target = document.createElement('div');
    document.body.append(target);
    const screens: MarketingScreen[] = ['home', 'tools-screen'].map((id) => ({
      id,
      title: id,
      description: id,
      defaults: {railExpanded: true},
      render: (s) =>
        previewScreen(APP, s as PreviewScreenState, {
          tab: id === 'home' ? 'home' : 'tools',
          content: html`<p>${id}</p>`,
        }),
    }));
    const screenHost = new ScreenHost(target, {
      registry: {
        screens,
        byId: (id) => screens.find((s) => s.id === id),
        categories: () => [],
      },
      id: 'home',
      window: 'fold',
    });
    try {
      for (const id of ['tools-screen', 'home', 'tools-screen']) {
        screenHost.go(id, {railExpanded: true});
        const el = target.querySelector('mnw-android-screen')!;
        await el.updateComplete;
        assert.ok(shadow(el).querySelector('.rail--expanded'));
        const labels = [
          ...shadow(el).querySelectorAll('.rail__title, .rail__label'),
        ];
        assert.isAbove(labels.length, 0);
        for (const label of labels) {
          assert.notInclude(
            getComputedStyle(label).animationName,
            'rail-label-in'
          );
          assert.equal(getComputedStyle(label).opacity, '1');
        }
      }
      const el = target.querySelector('mnw-android-screen')!;
      el.navigation = {railExpanded: false};
      await el.updateComplete;
      el.navigation = {railExpanded: true};
      await el.updateComplete;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        assert.include(
          getComputedStyle(shadow(el).querySelector('.rail__title')!)
            .animationName,
          'rail-label-in'
        );
    } finally {
      screenHost.destroy();
      target.remove();
    }
  });

  test('a static embed renders the shell without set() and settles its parts', async () => {
    const screens: MarketingScreen[] = [
      {
        id: 'home',
        title: 'Home',
        description: 'Home',
        defaults: {drawerOpen: true},
        render: (s) =>
          previewScreen(APP, s as PreviewScreenState, {
            tab: 'home',
            content: html`<p>home</p>`,
            overlay: {
              presentation: 'sheet',
              label: 'Sheet',
              content: html`<p>sheet</p>`,
            },
          }),
      },
    ];
    const embed = createMarketingEmbed({screens});
    const target = document.createElement('div');
    document.body.append(target);
    await embed.mount(target, 'home', {});
    const el = target.querySelector('mnw-android-screen')!;
    assert.isFalse(el.interactive);
    assert.ok(shadow(el).querySelector('.modal-drawer'));
    assert.ok(shadow(el).querySelector('.sheet'));
    // settle() reached the Material Web parts inside the shadow root.
    const button = shadow(el).querySelector('md-icon-button') as HTMLElement & {
      hasUpdated?: boolean;
    };
    assert.isTrue(Boolean(button.hasUpdated));
  });
});
