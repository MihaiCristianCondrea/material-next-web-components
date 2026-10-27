/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture, oneEvent} from '@open-wc/testing';
import {html} from 'lit';
import {
  COLOR_ROLES,
  applyColorTheme,
  colorScheme,
  colorThemeCss,
  createThemePreferenceStore,
  hctFromHex,
  hexFromHct,
  normalizeHex,
  normalizeThemePreference,
  type MaterialNextColorPicker,
  type MaterialNextHctSlider,
  type MaterialNextThemeButton,
  type MaterialNextThemeControls,
} from '../theme/index.js';

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

const clearTheme = () => {
  document.head.querySelector('style[data-mnw-color-theme]')?.remove();
  delete document.documentElement.dataset.colorMode;
  document.documentElement.style.colorScheme = '';
};

suite('theme domain', () => {
  test('normalizes hex colors', () => {
    assert.equal(normalizeHex('#ABC'), '#aabbcc');
    assert.equal(normalizeHex(' 6750A4 '), '#6750a4');
    assert.isUndefined(normalizeHex('purple'));
    assert.isUndefined(normalizeHex(42));
  });

  test('round-trips hex through HCT', () => {
    const hct = hctFromHex('#6750a4');
    assert.closeTo(hct.tone, 40, 1);
    assert.equal(hexFromHct(hct), '#6750a4');
  });

  test('generates every role, light and dark', () => {
    const light = colorScheme('#6750a4');
    const dark = colorScheme('#6750a4', {dark: true});
    assert.sameMembers(Object.keys(light), [...COLOR_ROLES]);
    for (const value of Object.values(light))
      assert.match(value, /^#[0-9a-f]{6}$/);
    assert.notEqual(light.primary, dark.primary);
    assert.notEqual(light.surface, dark.surface);
    // Light surfaces are light, dark ones dark.
    assert.isAbove(hctFromHex(light.surface).tone, 90);
    assert.isBelow(hctFromHex(dark.surface).tone, 10);
  });

  test('content keeps the source color as primary more than tonal spot', () => {
    const source = '#00c853';
    const chroma = (hex: string) => hctFromHex(hex).chroma;
    assert.isAbove(
      chroma(colorScheme(source, {variant: 'content'}).primary),
      chroma(colorScheme(source).primary)
    );
  });

  test('system CSS has light roles and dark ones under the media query', () => {
    const css = colorThemeCss({sourceColor: '#6750a4', mode: 'system'});
    assert.include(css, ':root { color-scheme: light;');
    assert.include(css, '@media (prefers-color-scheme: dark)');
    assert.include(css, '--md-sys-color-on-primary-container:');
    assert.notInclude(
      colorThemeCss({sourceColor: '#6750a4', mode: 'dark'}),
      '@media'
    );
  });
});

suite('theme preference store', () => {
  test('saves, loads and forgets a versioned preference', () => {
    const storage = memoryStorage();
    const store = createThemePreferenceStore({key: 't', storage});
    assert.deepEqual(store.load(), {mode: 'system'});
    store.save({sourceColor: '#ABCDEF', mode: 'dark'});
    assert.deepEqual(JSON.parse(storage.data.get('t')!), {
      version: 1,
      sourceColor: '#abcdef',
      mode: 'dark',
    });
    assert.deepEqual(store.load(), {sourceColor: '#abcdef', mode: 'dark'});
    store.reset();
    assert.isFalse(storage.data.has('t'));
  });

  test('drops invalid fields and survives corrupt storage', () => {
    assert.deepEqual(
      normalizeThemePreference({sourceColor: 'red', mode: 'dim', variant: 'x'}),
      {mode: 'system'}
    );
    const storage = memoryStorage();
    storage.data.set('t', '{nope');
    assert.deepEqual(createThemePreferenceStore({key: 't', storage}).load(), {
      mode: 'system',
    });
  });
});

suite('applyColorTheme', () => {
  teardown(clearTheme);

  test('writes one style last in head and the mode attribute', () => {
    applyColorTheme({sourceColor: '#006a6a', mode: 'dark'});
    applyColorTheme({sourceColor: '#006a6a', mode: 'dark'});
    const styles = document.head.querySelectorAll(
      'style[data-mnw-color-theme]'
    );
    assert.lengthOf(styles, 1);
    assert.equal(document.head.lastElementChild, styles[0]);
    assert.equal(document.documentElement.dataset.colorMode, 'dark');
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--md-sys-color-primary')
      .trim();
    assert.equal(primary, colorScheme('#006a6a', {dark: true}).primary);
  });

  test('system mode opts the document into both browser color schemes', () => {
    applyColorTheme({mode: 'dark'});
    applyColorTheme({mode: 'system'});
    assert.equal(document.documentElement.style.colorScheme, 'light dark');
    applyColorTheme({sourceColor: '#006a6a', mode: 'system'});
    assert.equal(document.documentElement.style.colorScheme, 'light dark');
  });

  test('without a source color removes the style and keeps the mode', () => {
    applyColorTheme({sourceColor: '#006a6a', mode: 'light'});
    applyColorTheme({mode: 'light'});
    assert.notExists(
      document.head.querySelector('style[data-mnw-color-theme]')
    );
    assert.equal(document.documentElement.dataset.colorMode, 'light');
    assert.equal(document.documentElement.style.colorScheme, 'light');
  });
});

suite('theme elements', () => {
  teardown(clearTheme);

  test('hct slider draws its gradient and relays one input event', async () => {
    const el = await fixture<MaterialNextHctSlider>(
      html`<mnw-hct-slider
        channel="tone"
        label="Tone"
        .value=${40}
        color="#6750a4"
      ></mnw-hct-slider>`
    );
    assert.match(el.gradient, /^linear-gradient\(to right, #000000 0\.0%/);
    assert.include(el.gradient, '#ffffff 100.0%');
    let count = 0;
    el.addEventListener('input', () => count++);
    const slider = el.shadowRoot!.querySelector('md-slider')!;
    slider.value = 70;
    slider.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    assert.equal(count, 1);
    assert.equal(el.value, 70);
  });

  test('color picker keeps the hue at chroma 0 and reports the value', async () => {
    const el = await fixture<MaterialNextColorPicker>(
      html`<mnw-color-picker value="#006a6a"></mnw-color-picker>`
    );
    const [hue, chroma] =
      el.shadowRoot!.querySelectorAll<MaterialNextHctSlider>('mnw-hct-slider');
    const before = hue.value;
    chroma.value = 0;
    setTimeout(() => chroma.dispatchEvent(new Event('input', {bubbles: true})));
    await oneEvent(el, 'input');
    await el.updateComplete;
    assert.isBelow(
      hctFromHex(el.value).chroma,
      3,
      `${el.value} ${JSON.stringify(hctFromHex(el.value))}`
    );
    assert.closeTo(hue.value, before, 0.01);
    el.value = 'not a color';
    await el.updateComplete;
    assert.match(el.value, /^#[0-9a-f]{6}$/);
  });

  test('controls persist, apply and reset', async () => {
    const key = 'mnw-test:theme';
    localStorage.removeItem(key);
    const el = await fixture<MaterialNextThemeControls>(
      html`<mnw-theme-controls storage-key=${key} apply></mnw-theme-controls>`
    );
    const picker =
      el.shadowRoot!.querySelector<MaterialNextColorPicker>(
        'mnw-color-picker'
      )!;
    picker.value = '#006a6a';
    setTimeout(() => picker.dispatchEvent(new Event('input', {bubbles: true})));
    const e = await oneEvent(el, 'color-theme-change');
    assert.deepEqual(e.detail, {sourceColor: '#006a6a', mode: 'system'});
    assert.include(localStorage.getItem(key)!, '#006a6a');
    assert.exists(document.head.querySelector('style[data-mnw-color-theme]'));

    // A fresh element on another page load picks the saved theme up.
    const again = await fixture<MaterialNextThemeControls>(
      html`<mnw-theme-controls storage-key=${key}></mnw-theme-controls>`
    );
    assert.equal(again.sourceColor, '#006a6a');

    el.reset();
    assert.isNull(localStorage.getItem(key));
    assert.notExists(
      document.head.querySelector('style[data-mnw-color-theme]')
    );
  });

  test('theme button opens a labelled panel and Escape closes it', async () => {
    const el = await fixture<MaterialNextThemeButton>(
      html`<mnw-theme-button storage-key="mnw-test:button"></mnw-theme-button>`
    );
    const trigger = el.shadowRoot!.querySelector<HTMLElement>('.trigger')!;
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    el.show();
    await el.updateComplete;
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(
      el
        .shadowRoot!.querySelector('[role="dialog"]')!
        .getAttribute('aria-label'),
      'Theme'
    );
    assert.exists(el.controls);
    el.shadowRoot!.querySelector('.popover')!.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
    );
    await el.updateComplete;
    assert.isFalse(el.open);
  });
});
