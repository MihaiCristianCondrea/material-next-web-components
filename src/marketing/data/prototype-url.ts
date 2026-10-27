/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  CAPTURED_PALETTE,
  NAV_TYPES,
  THEME_CHOICES,
  type NavType,
  type ThemeChoice,
} from '../domain/preview-settings.js';
import type {ScreenState} from '../domain/screen.js';
import {WINDOW_NAMES, type WindowName} from '../domain/windows.js';

export type PrototypeMode = 'inspect' | 'compare';
export type CompareAxis = 'theme' | 'nav' | 'palette' | 'frame';

export const COMPARE_AXES: readonly CompareAxis[] = [
  'theme',
  'nav',
  'palette',
  'frame',
];

/**
 * Everything the prototype page shows, as the URL carries it, so a link opens
 * the same view:
 *
 *   id=home-feed  mode=inspect|compare  compare=theme|nav|palette|frame
 *   palette=<name>|captured  paletteB=<name>  theme=system|light|dark
 *   nav=gesture|buttons  frame=device|none  window=phone|fold|desktop
 *   ads=on  state={"filter":"news"}  preset=<preset label>  panel=none
 *
 * `panel=none` is capture mode: the screen alone (in its device with
 * `frame=device`), nothing else on the page.
 */
export interface PrototypeView {
  id?: string;
  mode: PrototypeMode;
  compare: CompareAxis;
  palette: string;
  paletteB: string;
  theme: ThemeChoice;
  navType: NavType;
  deviceFrame: boolean;
  window: WindowName;
  showAds: boolean;
  state: ScreenState;
  preset?: string;
  capture: boolean;
}

export const DEFAULT_PROTOTYPE_VIEW: PrototypeView = {
  mode: 'inspect',
  compare: 'theme',
  palette: CAPTURED_PALETTE,
  paletteB: CAPTURED_PALETTE,
  theme: 'system',
  navType: 'gesture',
  deviceFrame: true,
  window: 'phone',
  showAds: false,
  state: {},
  capture: false,
};

const pick = <T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

export const parsePrototypeView = (
  params: URLSearchParams,
  {
    palettes,
    defaults = DEFAULT_PROTOTYPE_VIEW,
  }: {palettes: readonly string[]; defaults?: PrototypeView}
): PrototypeView => {
  const knownPalettes = [CAPTURED_PALETTE, ...palettes];
  let state: ScreenState = {};
  try {
    const raw = params.get('state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') state = parsed;
    }
  } catch {
    // A hand-edited link with broken JSON opens the screen's defaults.
  }
  return {
    id: params.get('id') ?? undefined,
    mode: pick(params.get('mode'), ['inspect', 'compare'], defaults.mode),
    compare: pick(params.get('compare'), COMPARE_AXES, defaults.compare),
    palette: pick(params.get('palette'), knownPalettes, defaults.palette),
    paletteB: pick(params.get('paletteB'), knownPalettes, defaults.paletteB),
    theme: pick(params.get('theme'), THEME_CHOICES, defaults.theme),
    navType: pick(params.get('nav'), NAV_TYPES, defaults.navType),
    deviceFrame: params.has('frame')
      ? params.get('frame') === 'device'
      : params.get('panel') === 'none'
        ? false
        : defaults.deviceFrame,
    window: pick(params.get('window'), WINDOW_NAMES, defaults.window),
    showAds: params.get('ads') === 'on',
    state,
    preset: params.get('preset') ?? undefined,
    capture: params.get('panel') === 'none',
  };
};

/** Writes only what differs from the defaults, so shared links stay short. */
export const writePrototypeView = (
  url: URL,
  view: PrototypeView,
  defaults: PrototypeView = DEFAULT_PROTOTYPE_VIEW
): URL => {
  const out = new URL(url.href);
  const p = out.searchParams;
  const set = (key: string, value: string, fallback: string) =>
    value === fallback ? p.delete(key) : p.set(key, value);
  if (view.id) p.set('id', view.id);
  p.delete('state');
  p.delete('preset');
  set('mode', view.mode, defaults.mode);
  if (view.mode === 'compare') p.set('compare', view.compare);
  else p.delete('compare');
  if (view.mode === 'compare' && view.compare === 'palette') {
    p.set('paletteB', view.paletteB);
  } else {
    p.delete('paletteB');
  }
  set('palette', view.palette, defaults.palette);
  set('theme', view.theme, defaults.theme);
  set('nav', view.navType, defaults.navType);
  set('window', view.window, defaults.window);
  p.set('frame', view.deviceFrame ? 'device' : 'none');
  if (view.showAds) p.set('ads', 'on');
  else p.delete('ads');
  return out;
};

/** The prototype link a gallery card opens. */
export const prototypeHref = (
  base: string | URL,
  id: string,
  {
    theme,
    navType,
    palette,
    deviceFrame,
    state,
  }: {
    theme?: ThemeChoice;
    navType?: NavType;
    palette?: string;
    deviceFrame?: boolean;
    state?: ScreenState;
  } = {}
): string => {
  const u = new URL(base);
  u.searchParams.set('id', id);
  if (theme && theme !== 'system') u.searchParams.set('theme', theme);
  if (navType && navType !== 'gesture') u.searchParams.set('nav', navType);
  if (palette && palette !== CAPTURED_PALETTE)
    u.searchParams.set('palette', palette);
  if (deviceFrame !== undefined)
    u.searchParams.set('frame', deviceFrame ? 'device' : 'none');
  if (state && Object.keys(state).length) {
    u.searchParams.set('state', JSON.stringify(state));
  }
  return u.href;
};
