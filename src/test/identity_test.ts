/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture} from '@open-wc/testing';
import {html} from 'lit';
import {
  applyProductTypefaces,
  defineProductIdentity,
  loadProductFonts,
  logoOf,
  supportUs,
  toolkitFooter,
  type MaterialNextAndroidScreen,
  type PreviewOverlay,
  type ProductIdentityConfig,
} from '../marketing/index.js';

const CONFIG: ProductIdentityConfig = {
  id: 'sample',
  name: 'Sample',
  icons: {app: '/logos/icon.svg', logo: '/logos/app_logo.svg'},
  fonts: {
    brand: {family: 'Sample Sans', weight: '1 1000'},
  },
  colors: {palettes: ['captured', 'blue', 'green'], defaultPalette: 'blue'},
  destinations: {
    tabs: [
      {id: 'home', label: 'Home', icon: 'home'},
      {id: 'tools', label: 'Tools', icon: 'build'},
    ],
    drawer: {footer: toolkitFooter()},
    overflow: [supportUs()],
  },
  links: {privacy: 'https://example.com/privacy'},
};

suite('defineProductIdentity', () => {
  test('one declaration feeds the shell and the hub', () => {
    const id = defineProductIdentity(CONFIG);
    assert.equal(id.app.config.name, 'Sample');
    assert.deepEqual(
      id.app.config.tabs.map((t) => t.id),
      ['home', 'tools']
    );
    assert.equal(logoOf(id.app), '/logos/app_logo.svg');
    assert.deepEqual(id.product, {
      id: 'sample',
      name: 'Sample',
      icon: '/logos/icon.svg',
      privacyUrl: 'https://example.com/privacy',
      codeOfConductUrl: '',
    });
    assert.deepEqual(id.palettes, ['captured', 'blue', 'green']);
    assert.equal(id.defaultPalette, 'blue');
  });

  test('assets follow the base the host sets, after the identity is defined', () => {
    const id = defineProductIdentity(CONFIG);
    id.setAssetBase('https://cdn.example.com/kit');
    assert.equal(
      logoOf(id.app),
      'https://cdn.example.com/kit/logos/app_logo.svg'
    );
    assert.equal(id.product.icon, 'https://cdn.example.com/kit/logos/icon.svg');
    assert.equal(
      id.asset('fonts/a.ttf'),
      'https://cdn.example.com/kit/fonts/a.ttf'
    );
    assert.equal(id.asset('data:image/svg+xml,x'), 'data:image/svg+xml,x');
  });

  test('the app can name itself apart from its store name', () => {
    const id = defineProductIdentity({
      ...CONFIG,
      name: 'Smart Sample',
      label: 'Sample',
    });
    assert.equal(id.app.config.name, 'Sample');
    assert.equal(id.product.name, 'Smart Sample');
  });

  test('the logo defaults to the launcher icon; the palettes to the captured tokens', () => {
    const id = defineProductIdentity({
      ...CONFIG,
      icons: {app: 'icon.png'},
      colors: undefined,
    });
    assert.equal(logoOf(id.app), '/icon.png');
    assert.deepEqual(id.palettes, ['captured']);
    assert.equal(id.defaultPalette, 'captured');
  });

  test('typefaces: plain falls back to brand, a fallback stack follows the family', () => {
    const id = defineProductIdentity(CONFIG);
    assert.equal(id.typefaces.brand, '"Sample Sans", system-ui, sans-serif');
    assert.equal(id.typefaces.plain, id.typefaces.brand);
  });

  test('an incomplete or inconsistent identity is refused', () => {
    assert.throws(
      () => defineProductIdentity({...CONFIG, icons: {app: ''}}),
      /icons\.app/
    );
    assert.throws(
      () =>
        defineProductIdentity({
          ...CONFIG,
          colors: {palettes: ['blue'], defaultPalette: 'red'},
        }),
      /default palette/
    );
    assert.throws(() =>
      defineProductIdentity({
        ...CONFIG,
        destinations: {
          tabs: [{id: 'settings', label: 'S', icon: 's'}],
          drawer: {footer: toolkitFooter()},
        },
      })
    );
  });

  test('the drawer header draws the resolved logo', async () => {
    const id = defineProductIdentity(CONFIG);
    // An about: base: resolved like any other, without a request.
    id.setAssetBase('about:blank#/kit/');
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${id.app}
        tab="home"
        .navigation=${{drawerOpen: true}}
      ></mnw-android-screen>`
    );
    await el.updateComplete;
    const header = el.shadowRoot!.querySelector('.drawer__header')!;
    assert.equal(
      header.querySelector('img')!.getAttribute('src'),
      'about:blank#/kit/logos/app_logo.svg'
    );
    assert.equal(header.textContent!.trim(), 'Sample');
  });

  test('typefaces and fonts reach the page', async () => {
    const id = defineProductIdentity(CONFIG);
    const el = document.createElement('div');
    applyProductTypefaces(id, el);
    assert.equal(
      el.style.getPropertyValue('--md-ref-typeface-plain'),
      '"Sample Sans", system-ui, sans-serif'
    );
    // No src: the page loads the face itself; only the typefaces and icon fonts are handled.
    await loadProductFonts(id);
    assert.equal(
      document.documentElement.style.getPropertyValue(
        '--md-ref-typeface-brand'
      ),
      '"Sample Sans", system-ui, sans-serif'
    );
    document.documentElement.style.removeProperty('--md-ref-typeface-brand');
    document.documentElement.style.removeProperty('--md-ref-typeface-plain');
  });
});

suite('App Toolkit presets', () => {
  test('toolkitFooter() is ToolkitDrawer.kt: settings, help, updates, share', () => {
    assert.deepEqual(
      toolkitFooter().map((e) => e.label),
      ['Settings', 'Help & feedback', 'Updates', 'Share']
    );
    assert.deepEqual(
      toolkitFooter({updates: false}).map((e) => e.id),
      ['settings', 'help', 'share']
    );
    // Library pages are not drawn by previews unless the app draws one.
    assert.isUndefined(toolkitFooter()[0].screen);
    assert.equal(
      toolkitFooter({screens: {help: 'help-screen'}})[1].screen,
      'help-screen'
    );
  });

  test('supportUs() is the overflow entry', () => {
    assert.deepEqual(supportUs(), {
      id: 'support',
      label: 'Support the app',
      icon: 'volunteer_activism',
    });
    assert.equal(supportUs({screen: 'support'}).screen, 'support');
  });
});

suite('Android preview additions', () => {
  const app = defineProductIdentity({
    ...CONFIG,
    destinations: {
      ...CONFIG.destinations,
      drawer: {
        entries: [{id: 'trash', label: 'Trash', icon: 'delete', badge: '1'}],
        footer: toolkitFooter(),
      },
    },
    preview: {statusBar: 'blank'},
  }).app;

  test('a drawer entry shows its badge; the status bar can stay blank', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${app}
        tab="home"
        .navigation=${{drawerOpen: true}}
      ></mnw-android-screen>`
    );
    const root = el.shadowRoot!;
    assert.equal(root.querySelector('.modal-drawer .badge')!.textContent, '1');
    assert.equal(root.querySelector('.status')!.textContent!.trim(), '');
  });

  test('the bottom slot sits under the content; collapse drives a large bar', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${app}
        tab="home"
        kind="page"
        top-bar="large"
        heading="Large files"
        .collapse=${1}
        ><p>content</p>
        <div slot="bottom">Clean</div></mnw-android-screen
      >`
    );
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(r));
    assert.isTrue(el.hasAttribute('data-bottom'));
    assert.isTrue(el.hasAttribute('data-scrolled'));
    assert.equal(el.style.getPropertyValue('--_collapse'), '1.000');
    const bottom = el.shadowRoot!.querySelector('.bottom')!;
    const content = el.shadowRoot!.querySelector('.content')!;
    assert.isAtLeast(
      bottom.getBoundingClientRect().top,
      content.getBoundingClientRect().bottom - 1
    );
  });

  test('the Toolkit footer draws Settings and Share rounded, as the library does', () => {
    const [settings, , , share] = toolkitFooter();
    assert.deepEqual(settings.icon, {name: 'settings', rounded: true});
    assert.deepEqual(share.icon, {name: 'share', rounded: true});
  });
});

suite('Overlay presentations', () => {
  const app = defineProductIdentity(CONFIG).app;
  const mount = (overlay: PreviewOverlay) =>
    fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${app}
        tab="home"
        interactive
        .overlay=${overlay}
        ><div slot="overlay">Body</div></mnw-android-screen
      >`
    );

  test('a dialog is centred over a scrim and dismissed by it', async () => {
    const el = await mount({presentation: 'dialog', label: 'Delete files?'});
    let dismissed = 0;
    el.addEventListener('preview-dismiss', () => dismissed++);
    const root = el.shadowRoot!;
    const dialog = root.querySelector<HTMLElement>('.dialog')!;
    assert.equal(dialog.getAttribute('role'), 'alertdialog');
    const box = dialog.getBoundingClientRect();
    const host = el.getBoundingClientRect();
    assert.closeTo(box.left - host.left, host.right - box.right, 1);
    root.querySelector<HTMLElement>('.scrim')!.click();
    assert.equal(dismissed, 1);
  });

  test('a sheet can draw a drag handle and leave its padding to the content', async () => {
    const el = await mount({
      presentation: 'sheet',
      label: 'Sort',
      handle: true,
      flush: true,
    });
    const sheet = el.shadowRoot!.querySelector<HTMLElement>('.sheet')!;
    assert.ok(sheet.querySelector('.sheet__handle'));
    assert.equal(getComputedStyle(sheet).paddingLeft, '0px');
  });
});

suite('Scrolling screens', () => {
  const app = defineProductIdentity(CONFIG).app;

  test('the content starts where scrollPosition puts it, and the large bar follows', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${app}
        tab="home"
        kind="page"
        top-bar="large"
        heading="A long article title"
        .titleLines=${2}
        .scrollPosition=${200}
        ><div style="height:3000px"></div
      ></mnw-android-screen>`
    );
    await el.updateComplete;
    const content = el.shadowRoot!.querySelector('.content')!;
    assert.equal(content.scrollTop, 200);
    assert.equal(el.style.getPropertyValue('--_title-lines'), '2');
    assert.equal(el.style.getPropertyValue('--_collapse'), '1.000');
    assert.isTrue(el.hasAttribute('data-scrolled'));
    let reported: {scrollTop: number} | undefined;
    el.addEventListener(
      'preview-scroll',
      (e) => (reported = (e as CustomEvent).detail)
    );
    content.scrollTop = 400;
    content.dispatchEvent(new Event('scroll'));
    assert.equal(reported?.scrollTop, 400);
  });

  test("the shell's bars stack above the scrolling content", async () => {
    // Chromium hit-tests a `contain: paint` card outside its scroller's clip (App Toolkit's Quick
    // Tools, scrolled, caught the Play & Decide tab): the bars must sit above the content.
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen .app=${app} tab="home"></mnw-android-screen>`
    );
    await el.updateComplete;
    const root = el.shadowRoot!;
    assert.equal(
      getComputedStyle(root.querySelector('.content')!).zIndex,
      'auto'
    );
    for (const bar of ['.status', '.topbar', '.navbar']) {
      const style = getComputedStyle(root.querySelector(bar)!);
      assert.equal(style.position, 'relative', bar);
      assert.equal(style.zIndex, '1', bar);
    }
  });

  test('a navigation bar hidden on scroll gives its inset back', async () => {
    const el = await fixture<MaterialNextAndroidScreen>(
      html`<mnw-android-screen
        .app=${app}
        tab="home"
        hide-navigation-bar
      ></mnw-android-screen>`
    );
    await el.updateComplete;
    assert.notOk(el.shadowRoot!.querySelector('.navbar'));
    assert.equal(el.style.getPropertyValue('--_bottom-bar'), '0px');
  });
});
