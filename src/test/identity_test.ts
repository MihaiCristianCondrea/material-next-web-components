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
