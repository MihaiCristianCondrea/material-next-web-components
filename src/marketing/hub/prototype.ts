/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import {html, render, type TemplateResult} from 'lit';
import {
  DEFAULT_PROTOTYPE_VIEW,
  parsePrototypeView,
  writePrototypeView,
  type PrototypeView,
} from '../data/prototype-url.js';
import type {MarketingProduct} from '../domain/product.js';
import {
  paletteLabel,
  resolveTheme,
  type ResolvedTheme,
} from '../domain/preview-settings.js';
import {
  createScreenRegistry,
  type MarketingScreen,
  type ScreenRegistry,
  type ScreenState,
} from '../domain/screen.js';
import {installHubStyles, setHubTheme} from '../ui/hub-document.js';
import {NAV_ICONS} from '../ui/options.js';
import '../ui/prototype-layout.js';
import '../ui/screen-inspector.js';
import {ScreenHost, type ScreenHostOptions} from './screen-host.js';

export interface PrototypeOptions {
  product: MarketingProduct;
  screens: readonly MarketingScreen[] | ScreenRegistry;
  palettes?: readonly string[];
  /** Defaults for parameters the URL leaves out. */
  defaults?: Partial<PrototypeView>;
  /** The gallery, relative to this page. */
  galleryUrl?: string;
  /** Show the "Show ads" switch (apps with ad stand-ins). */
  adsToggle?: boolean;
  /**
   * A frameless phone fills the stage (screens that adapt to their width, as
   * App Toolkit layouts do). Off: it keeps the phone's size, scaled to fit.
   */
  fillPhone?: boolean;
  root?: HTMLElement;
}

type Side = {label: string; icon: string; patch: Partial<HostView>};
type HostView = Pick<
  ScreenHostOptions,
  'palette' | 'theme' | 'frame' | 'navType' | 'window' | 'showAds' | 'fill'
>;

/**
 * Renders the prototype page: one live screen beside the inspector, or two
 * side by side to compare a theme, navigation, palette or the frame. With
 * `panel=none` in the URL it renders only the screen (in its device with
 * `frame=device`), which is what capture scripts screenshot. The page sets `data-ready` on <html> once
 * fonts and icons are in.
 */
export const mountScreenPrototype = ({
  product,
  screens,
  palettes = [],
  defaults: defaultOverrides,
  galleryUrl = './',
  adsToggle = false,
  fillPhone = true,
  root = document.body,
}: PrototypeOptions) => {
  installHubStyles();
  const registry = Array.isArray(screens)
    ? createScreenRegistry(screens)
    : (screens as ScreenRegistry);
  const defaults = {...DEFAULT_PROTOTYPE_VIEW, ...defaultOverrides};
  const view = parsePrototypeView(new URLSearchParams(location.search), {
    palettes,
    defaults,
  });
  let id = registry.byId(view.id)?.id ?? registry.screens[0]?.id;
  if (!id) throw new Error('No screens to show');

  // A named preset from the screen's controls, merged under explicit state.
  let initial: ScreenState = {...view.state};
  if (view.preset) {
    const presets = registry
      .byId(id)
      ?.controls?.find((c) => c.type === 'presets');
    const match =
      presets?.type === 'presets'
        ? presets.options.find(
            ([label]) => label.toLowerCase() === view.preset!.toLowerCase()
          )
        : undefined;
    if (match) initial = {...match[1], ...initial};
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = (): ResolvedTheme => resolveTheme(view.theme, media.matches);
  const markReady = () =>
    Promise.all([
      document.fonts.ready,
      customElements.whenDefined('md-icon'),
    ]).then(() =>
      requestAnimationFrame(() =>
        document.documentElement.setAttribute('data-ready', '')
      )
    );

  const hostView = (): HostView => ({
    palette: view.palette,
    theme: theme(),
    frame: view.deviceFrame,
    navType: view.navType,
    window: view.window,
    showAds: view.showAds,
    // A frameless phone fills the stage as the app fills a phone; larger
    // windows keep their size, because the app lays itself out for it.
    fill: fillPhone && view.window === 'phone',
  });

  if (view.capture) {
    root.classList.add('mnw-capture');
    root.classList.toggle('mnw-capture--framed', view.deviceFrame);
    const host = new ScreenHost(root, {
      registry,
      id,
      state: initial,
      ...hostView(),
      fill: false,
      onGo: () => {},
    });
    markReady();
    return {hosts: () => [host]};
  }

  let hosts: ScreenHost[] = [];
  let retained: ScreenState = initial;

  const sides = (): [Side, Side] => {
    switch (view.compare) {
      case 'nav':
        return [
          {
            label: 'Gesture navigation',
            icon: NAV_ICONS.gesture,
            patch: {navType: 'gesture'},
          },
          {
            label: '3-button navigation',
            icon: NAV_ICONS.buttons,
            patch: {navType: 'buttons'},
          },
        ];
      case 'palette':
        return [
          {
            label: paletteLabel(view.palette),
            icon: 'palette',
            patch: {palette: view.palette},
          },
          {
            label: paletteLabel(view.paletteB),
            icon: 'palette',
            patch: {palette: view.paletteB},
          },
        ];
      case 'frame':
        return [
          {label: 'Device frame', icon: 'smartphone', patch: {frame: true}},
          {label: 'Screen only', icon: 'crop_free', patch: {frame: false}},
        ];
      default:
        return [
          {label: 'Light theme', icon: 'light_mode', patch: {theme: 'light'}},
          {label: 'Dark theme', icon: 'dark_mode', patch: {theme: 'dark'}},
        ];
    }
  };

  const syncUrl = () => {
    history.replaceState(
      null,
      '',
      writePrototypeView(new URL(location.href), {...view, id}, defaults)
    );
    document.title = `${registry.byId(id)?.title ?? id} · ${product.name} UI kit`;
  };

  // Hosts navigate together, so a comparison keeps showing one screen.
  const navigate = (target: string, state?: ScreenState) => {
    id = target;
    for (const h of hosts) h.load(target, state);
    syncUrl();
    draw();
  };

  const buildStage = (): TemplateResult =>
    view.mode === 'compare'
      ? html`<div class="mnw-compare">
          ${sides().map(
            (side) =>
              html`<div class="mnw-compare__col">
                <div class="mnw-compare__label">
                  <md-icon>${side.icon}</md-icon><span>${side.label}</span>
                </div>
                <div class="mnw-stage"><div class="mnw-host"></div></div>
              </div>`
          )}
        </div>`
      : html`<div class="mnw-stage"><div class="mnw-host"></div></div>`;

  const rebuildHosts = () => {
    retained = structuredClone(hosts[0]?.state ?? retained);
    for (const h of hosts) h.destroy();
    hosts = [];
    const els = root.querySelectorAll<HTMLElement>('.mnw-host');
    const patches =
      view.mode === 'compare' ? sides().map((s) => s.patch) : [{}];
    els.forEach((el, i) => {
      hosts.push(
        new ScreenHost(el, {
          registry,
          id,
          state: retained,
          ...hostView(),
          ...patches[i],
          onGo: (target, state) => navigate(target, state),
          onChange: () => draw(),
        })
      );
    });
    requestAnimationFrame(fit);
  };

  // Larger windows and devices keep their size and are scaled down to fit the stage.
  const fit = () => {
    for (const el of root.querySelectorAll<HTMLElement>(
      '.mnw-stage > .mnw-mount:not(.mnw-mount--fill)'
    )) {
      el.style.zoom = '';
      const child = el.firstElementChild as HTMLElement | null;
      if (!child) continue;
      const box = el.parentElement!.getBoundingClientRect();
      const w = child.offsetWidth;
      const h = child.offsetHeight;
      if (!w || !h) continue;
      const zoom = Math.min(1, (box.width - 32) / w, (box.height - 32) / h);
      el.style.zoom = zoom < 1 ? zoom.toFixed(4) : '';
    }
  };
  addEventListener('resize', () => requestAnimationFrame(fit));

  let stageKey = '';
  const draw = () => {
    setHubTheme(theme());
    const screen = registry.byId(id)!;
    const capture = new URL(location.href);
    capture.searchParams.set('id', id);
    capture.searchParams.set('frame', view.deviceFrame ? 'device' : 'none');
    capture.searchParams.set('panel', 'none');
    capture.searchParams.set(
      'state',
      JSON.stringify(hosts[0]?.state ?? retained)
    );
    render(
      html`<mnw-prototype-layout>
        <div slot="stage" class="mnw-stage-root">${buildStage()}</div>
        <mnw-screen-inspector
          slot="panel"
          .screen=${screen}
          .screens=${registry.screens}
          .view=${{...view, id}}
          .palettes=${palettes}
          .state=${hosts[0]?.state ?? retained}
          gallery-href=${galleryUrl}
          capture-href=${capture.href}
          ?ads-toggle=${adsToggle}
          @view-change=${(e: CustomEvent<Partial<PrototypeView>>) => {
            Object.assign(view, e.detail);
            syncUrl();
            draw();
          }}
          @screen-select=${(e: CustomEvent<{id: string}>) => navigate(e.detail.id)}
          @state-patch=${(e: CustomEvent<{patch: ScreenState}>) => hosts[0]?.set(e.detail.patch)}
          @state-reset=${() => hosts[0]?.reset()}
        ></mnw-screen-inspector>
      </mnw-prototype-layout>`,
      root
    );
    // Rebuild hosts only when the stage's shape changes; otherwise update them in place.
    const key = `${view.mode}:${view.compare}`;
    if (key !== stageKey) {
      stageKey = key;
      rebuildHosts();
      // Once more, so the inspector shows the new hosts' state.
      draw();
    } else {
      const patches =
        view.mode === 'compare' ? sides().map((s) => s.patch) : [{}];
      hosts.forEach((h, i) => h.setOptions({...hostView(), ...patches[i]}));
      requestAnimationFrame(fit);
    }
  };

  media.addEventListener('change', () => view.theme === 'system' && draw());
  syncUrl();
  draw();
  markReady();
  return {hosts: () => [...hosts]};
};
