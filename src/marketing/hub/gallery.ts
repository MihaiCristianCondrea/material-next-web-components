/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, nothing, render} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {prototypeHref} from '../data/prototype-url.js';
import {
  createPreviewSettingsStore,
  type PreviewSettingsStore,
} from '../data/preview-settings-store.js';
import type {MarketingProduct} from '../domain/product.js';
import {
  DEFAULT_PREVIEW_SETTINGS,
  resolveTheme,
  sanitizeSettings,
  type NavType,
  type PreviewSettings,
  type ResolvedTheme,
} from '../domain/preview-settings.js';
import {
  createScreenRegistry,
  type MarketingScreen,
  type ScreenRegistry,
} from '../domain/screen.js';
import {installHubStyles, setHubTheme} from '../ui/hub-document.js';
import {ALL_CATEGORIES} from '../ui/marketing-shell.js';
import '../ui/marketing-shell.js';
import '../ui/screen-card.js';
import {ScreenHost} from './screen-host.js';

export interface GalleryOptions {
  product: MarketingProduct;
  /** The app's screens in catalog order, or a registry of them. */
  screens: readonly MarketingScreen[] | ScreenRegistry;
  /** The app's palette names (from App Toolkit). "captured" is implied. */
  palettes?: readonly string[];
  /** Drawer presentation. Defaults to `modal`, closed at every width. */
  navigationMode?: 'auto' | 'modal' | 'permanent';
  /** Shell width from which an automatic drawer is permanent. */
  permanentFrom?: number;
  /** Optional navigation elements for the shell's navigation slot. */
  navigation?: () => unknown;
  /** Overrides of the hub defaults, for example `{palette: 'android'}`. */
  defaults?: Partial<PreviewSettings>;
  /** The prototype page, relative to the gallery. */
  prototypeUrl?: string;
  /** Where the hub renders. */
  root?: HTMLElement;
  /** Settings persistence; per product in localStorage by default. */
  store?: PreviewSettingsStore;
  /** App-specific sections after the catalog, rendered in light DOM with the app's CSS. */
  extra?: () => unknown;
}

export interface GalleryHandle {
  readonly registry: ScreenRegistry;
  settings(): PreviewSettings;
  update(settings: Partial<PreviewSettings>): void;
  destroy(): void;
}

const asRegistry = (screens: GalleryOptions['screens']): ScreenRegistry =>
  Array.isArray(screens)
    ? createScreenRegistry(screens)
    : (screens as ScreenRegistry);

/**
 * Renders a complete marketing gallery: the shell, every screen as a running
 * card, per-card theme and navigation toggles, and links into the prototype.
 */
export const mountMarketingGallery = ({
  product,
  screens,
  palettes = [],
  defaults: defaultOverrides,
  prototypeUrl = 'screen.html',
  root = document.body,
  store,
  extra,
  navigationMode = 'modal',
  permanentFrom = 900,
  navigation,
}: GalleryOptions): GalleryHandle => {
  installHubStyles();
  const registry = asRegistry(screens);
  const defaults = sanitizeSettings(
    {...DEFAULT_PREVIEW_SETTINGS, ...defaultOverrides},
    {palettes}
  );
  const settingsStore =
    store ??
    createPreviewSettingsStore({productId: product.id, palettes, defaults});
  let settings = settingsStore.load();
  let category = ALL_CATEGORIES;
  const cardTheme = new Map<string, ResolvedTheme>();
  const cardNav = new Map<string, NavType>();
  const hosts = new Map<string, ScreenHost>();
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const theme = () => resolveTheme(settings.theme, media.matches);
  const hrefFor = (id: string, state?: Record<string, unknown>) =>
    prototypeHref(new URL(prototypeUrl, location.href), id, {
      theme: cardTheme.get(id) ?? settings.theme,
      navType: cardNav.get(id) ?? settings.navType,
      palette: settings.palette,
      deviceFrame: settings.deviceFrame,
      state,
    });

  const update = (patch: Partial<PreviewSettings>) => {
    settings = {...settings, ...patch};
    // A hub-wide choice replaces the per-card ones it covers.
    if ('theme' in patch) cardTheme.clear();
    if ('navType' in patch) cardNav.clear();
    settingsStore.save(settings);
    draw();
  };

  const card = (s: MarketingScreen, index: number) => {
    const dark = (cardTheme.get(s.id) ?? theme()) === 'dark';
    const nav = cardNav.get(s.id) ?? settings.navType;
    return html`<mnw-screen-card
      style="--mnw-card-index: ${index}"
      heading=${s.title}
      description=${s.description}
      tag=${s.categoryLabel ?? s.category ?? ''}
      href=${hrefFor(s.id)}
      ?framed=${settings.deviceFrame}
      ?dark=${dark}
      ?three-button=${nav === 'buttons'}
      @card-theme-toggle=${(e: CustomEvent<{selected: boolean}>) => {
        cardTheme.set(s.id, e.detail.selected ? 'dark' : 'light');
        draw();
      }}
      @card-nav-toggle=${(e: CustomEvent<{selected: boolean}>) => {
        cardNav.set(s.id, e.detail.selected ? 'buttons' : 'gesture');
        draw();
      }}
      ><div data-screen=${s.id}></div
    ></mnw-screen-card>`;
  };

  const draw = () => {
    setHubTheme(theme());
    const visible = registry.screens.filter(
      (s) => !category || s.category === category
    );
    render(
      html`<mnw-marketing-shell
        .product=${product}
        .settings=${settings}
        .defaults=${defaults}
        .palettes=${palettes}
        .categories=${registry.categories()}
        .category=${category}
        .count=${visible.length}
        .navigationMode=${navigationMode}
        .permanentFrom=${permanentFrom}
        @settings-change=${(e: CustomEvent<PreviewSettings>) => update(e.detail)}
        @category-change=${(e: CustomEvent<{category: string}>) => {
          category = e.detail.category;
          draw();
        }}
        >${navigation ? html`<div slot="navigation">${navigation()}</div>` : nothing}${repeat(visible, (s) => s.id, card)}${
          extra ? html`<div slot="extra">${extra()}</div>` : nothing
        }</mnw-marketing-shell
      >`,
      root
    );
    mountHosts();
  };

  const mountHosts = () => {
    for (const [id, host] of hosts) {
      if (!host.el.isConnected) {
        host.destroy();
        hosts.delete(id);
      }
    }
    for (const el of root.querySelectorAll<HTMLElement>('[data-screen]')) {
      const id = el.dataset.screen!;
      const options = {
        palette: settings.palette,
        theme: cardTheme.get(id) ?? theme(),
        frame: settings.deviceFrame,
        navType: cardNav.get(id) ?? settings.navType,
        fill: true,
      };
      const existing = hosts.get(id);
      if (existing?.el === el) {
        existing.setOptions(options);
        continue;
      }
      existing?.destroy();
      hosts.set(
        id,
        new ScreenHost(el, {
          registry,
          id,
          ...options,
          // A card's buttons that open another screen open it in the prototype.
          onGo: (target, state) => location.assign(hrefFor(target, state)),
        })
      );
    }
  };

  const onSystemTheme = () => settings.theme === 'system' && draw();
  media.addEventListener('change', onSystemTheme);
  draw();

  return {
    registry,
    settings: () => ({...settings}),
    update,
    destroy() {
      media.removeEventListener('change', onSystemTheme);
      for (const host of hosts.values()) host.destroy();
      hosts.clear();
      render(null, root);
    },
  };
};
