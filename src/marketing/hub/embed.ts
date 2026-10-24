/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, render, type TemplateResult} from 'lit';
import {CAPTURED_PALETTE, resolvePalette} from '../domain/preview-settings.js';
import {
  createScreenRegistry,
  type MarketingScreen,
  type ScreenRegistry,
  type ScreenState,
} from '../domain/screen.js';
import {windowOf, type WindowSpec} from '../domain/windows.js';
import {configureMarketingAssets} from '../ui/assets.js';
import '../ui/device-frame.js';

export interface EmbedSetupOptions {
  /** Where the hub's own assets are served (fonts, illustrations). */
  assetBase?: string;
  /** Where this package's assets are served (device frames, badges). */
  marketingAssetBase?: string;
  palette?: string;
  theme?: 'light' | 'dark';
}

export interface EmbedOptions<P> {
  screens: readonly MarketingScreen[] | ScreenRegistry;
  /** Loads the app's theme: fonts, palettes, kit CSS. Receives the setup options. */
  loadTheme?: (options: EmbedSetupOptions) => Promise<void> | void;
  /** Screen pieces a film can mount alone, built by the same code as the screens. */
  parts?: P;
}

/** Waits until every Lit and Material Web element under `root` has rendered. */
export const settle = async (root: Element) => {
  for (let i = 0; i < 3; i++) {
    const pending = [...root.querySelectorAll('*')]
      .map(
        (e) =>
          (e as Element & {updateComplete?: Promise<unknown>}).updateComplete
      )
      .filter(Boolean);
    await Promise.all(pending);
  }
};

/**
 * The framework-free entry for motion tools (Remotion, Playwright, anything
 * with a DOM). State comes from the frame number, so there is no clock and no
 * `set()` or `go()`; `mount()` resolves once everything has rendered, so a
 * frame captured right after it is complete.
 *
 *   const {setup, mount} = createMarketingEmbed({screens: SCREENS, loadTheme});
 *   await setup({assetBase: staticFile('/')});
 *   await mount(el, 'home-feed', {query: 'Compose'});
 */
export const createMarketingEmbed = <P = Record<string, never>>({
  screens,
  loadTheme,
  parts,
}: EmbedOptions<P>) => {
  const registry = Array.isArray(screens)
    ? createScreenRegistry(screens)
    : (screens as ScreenRegistry);

  const setup = async (options: EmbedSetupOptions = {}) => {
    if (options.marketingAssetBase)
      configureMarketingAssets({base: options.marketingAssetBase});
    const root = document.documentElement;
    // Frames come from state: no CSS animations or transitions in renders.
    root.dataset.motion = 'frame';
    if (options.palette) root.dataset.palette = options.palette;
    if (options.theme) root.dataset.theme = options.theme;
    await loadTheme?.(options);
    await customElements.whenDefined('md-icon').catch(() => undefined);
  };

  /**
   * Renders screen `id` with `state` over its defaults. `window` (phone, fold,
   * desktop or a size) picks the app's layout; `frame` adds that window's device.
   */
  const mount = async (
    el: HTMLElement,
    id: string,
    state: ScreenState = {},
    {
      frame = false,
      palette,
      window: win,
      showAds = false,
    }: {
      frame?: boolean;
      palette?: string;
      window?: string | WindowSpec;
      showAds?: boolean;
    } = {}
  ) => {
    const screen = registry.byId(id);
    if (!screen) {
      throw new Error(
        `Unknown screen "${id}". Known: ${registry.screens.map((s) => s.id).join(', ')}`
      );
    }
    const p = palette ? resolvePalette(palette, screen.palette) : undefined;
    if (p) el.dataset.palette = p;
    const w = win ?? (state.window as string | WindowSpec | undefined);
    // Ads are off unless asked for: marketing media never shows ad UI.
    const tpl = screen.render({
      ...structuredClone(screen.defaults),
      ...state,
      window: w,
      showAds: (state.showAds as boolean | undefined) ?? showAds,
      navType:
        (state.navType as 'gesture' | 'buttons' | undefined) ?? 'gesture',
    });
    const device = windowOf(w).device;
    render(
      frame && device
        ? html`<mnw-device-frame device=${device}>${tpl}</mnw-device-frame>`
        : tpl,
      el
    );
    await settle(el);
  };

  /** Renders one piece from `parts` into `el`, with the same settle guarantee. */
  const mountPart = async (
    el: HTMLElement,
    build: (parts: P) => TemplateResult,
    {palette}: {palette?: string} = {}
  ) => {
    if (palette && palette !== CAPTURED_PALETTE) el.dataset.palette = palette;
    // .sc-part gives a piece the text context a screen would, without adding a box.
    render(html`<div class="sc-part">${build(parts as P)}</div>`, el);
    await settle(el);
  };

  return {registry, setup, mount, mountPart, parts: parts as P};
};
