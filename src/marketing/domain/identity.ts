/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  definePreviewApp,
  type PreviewApp,
  type PreviewEntry,
  type PreviewTab,
} from '../android/preview-app.js';
import type {MarketingProduct} from './product.js';

/**
 * A font the app sets its type in. `src` is an asset path, resolved against the identity's asset
 * base when the font loads; without it the page is expected to load the font itself.
 */
export interface IdentityFont {
  family: string;
  src?: string;
  /** The `format()` hint for `src`. Default `truetype`. */
  format?: string;
  /** FontFace descriptors: a variable font's ranges, such as `'1 1000'` and `'25% 151%'`. */
  weight?: string;
  stretch?: string;
  style?: string;
  /** The stack after the family. Default `system-ui, sans-serif`. */
  fallback?: string;
}

/** The app's icon and its variants, as asset paths relative to the app's public folder. */
export interface IdentityIcons {
  /** The square launcher icon: the hub's drawer, favicons, store listings. */
  app: string;
  /** The mark beside the name inside the app (`ShellGraph.appIcon`): the drawer header. Defaults to `app`. */
  logo?: string;
  /** A single-colour mark, for themed icons and one-colour artwork. */
  monochrome?: string;
}

/** Where the app's colour roles come from. The palettes themselves stay in the app's stylesheet. */
export interface IdentityColors {
  /**
   * The palettes the app ships, as `data-palette` values, in the order pickers list them.
   * `captured` stands for the tokens the page already has.
   */
  palettes: readonly string[];
  /** The palette previews start in. Defaults to the first. */
  defaultPalette?: string;
  /** The brand colour, as a CSS colour: theme-color metadata and accents outside the app. */
  seed?: string;
}

/** The app's navigation (`toolkitGraph { tab(); drawer {}; overflow {} }`). */
export interface IdentityDestinations {
  tabs: PreviewTab[];
  drawer?: {entries?: PreviewEntry[]; footer?: PreviewEntry[]};
  overflow?: PreviewEntry[];
}

/**
 * Everything that makes an app recognisably itself, declared once (`appTitle`, `appIcon`, the
 * theme's typography and colour scheme, and the graph's destinations). The app bars, rails, drawers
 * and previews read it through `identity.app`; the marketing hub through `identity.product`.
 */
export interface ProductIdentityConfig {
  /** Stable id: namespaces stored preview settings. */
  id: string;
  /** The name as the launcher and the store show it (`R.string.app_name`). */
  name: string;
  icons: IdentityIcons;
  fonts?: {
    /** Display, headline and title type: `--md-ref-typeface-brand`. */
    brand?: IdentityFont;
    /** Body and label type: `--md-ref-typeface-plain`. Defaults to `brand`. */
    plain?: IdentityFont;
    /** Icon fonts the destinations draw with, loaded before a capture. */
    symbols?: readonly string[];
  };
  colors?: IdentityColors;
  destinations: IdentityDestinations;
  links?: {repository?: string; privacy?: string; codeOfConduct?: string};
  /** How the Android preview draws the system around the app. */
  preview?: {statusBar?: 'clock' | 'blank'};
}

export interface ProductIdentity {
  readonly config: Readonly<ProductIdentityConfig>;
  /** The shell declaration the Android preview draws, with the name and mark. */
  readonly app: PreviewApp;
  /** What the marketing hub shows: the name, the launcher icon at the current asset base, the legal links. */
  readonly product: Required<MarketingProduct>;
  readonly palettes: readonly string[];
  readonly defaultPalette: string;
  /** `--md-ref-typeface-brand` and `--md-ref-typeface-plain`, as font stacks. */
  readonly typefaces: {brand: string; plain: string};
  /** Resolves an asset path against the current base. */
  asset(path: string): string;
  /** Moves every asset path, such as for Remotion's `staticFile()` root. Default `/`. */
  setAssetBase(base: string): void;
}

const DEFAULT_SYMBOLS = ['Material Symbols Outlined'];
const stack = (font: IdentityFont | undefined) =>
  font
    ? `"${font.family}", ${font.fallback ?? 'system-ui, sans-serif'}`
    : 'system-ui, sans-serif';

/**
 * Validates and freezes an app's identity. Assets stay in the app; the identity names them and
 * resolves them against a base the host can move.
 *
 *   export const IDENTITY = defineProductIdentity({
 *     id: 'app-toolkit',
 *     name: 'App Toolkit',
 *     icons: {app: '/logos/icon.svg', logo: '/logos/app_logo.svg'},
 *     fonts: {brand: {family: 'Google Sans Flex', src: 'fonts/GoogleSansFlex.ttf'}},
 *     colors: {palettes: ['captured', 'blue']},
 *     destinations: {tabs: [...], drawer: {footer: toolkitFooter()}, overflow: [supportUs()]},
 *   });
 */
export const defineProductIdentity = (
  config: ProductIdentityConfig
): ProductIdentity => {
  if (!config.id) throw new Error('A product identity needs an id.');
  if (!config.name) throw new Error('A product identity needs a name.');
  if (!config.icons?.app)
    throw new Error(`"${config.id}" needs icons.app, its launcher icon.`);
  const palettes = config.colors?.palettes ?? ['captured'];
  if (!palettes.length) throw new Error(`"${config.id}" declares no palettes.`);
  const defaultPalette = config.colors?.defaultPalette ?? palettes[0];
  if (!palettes.includes(defaultPalette))
    throw new Error(
      `"${config.id}": the default palette "${defaultPalette}" is not one of its palettes.`
    );

  let base = '/';
  const asset = (path: string) =>
    /^(?:[a-z]+:|\/\/)/i.test(path)
      ? path
      : base + (path.startsWith('/') ? path.slice(1) : path);
  const logo = config.icons.logo ?? config.icons.app;
  const app = definePreviewApp({
    name: config.name,
    // Resolved on every render, so a base set after the identity loads still applies.
    logo: () => asset(logo),
    ...config.destinations,
    statusBar: config.preview?.statusBar,
  });
  const brand = config.fonts?.brand;
  const plain = config.fonts?.plain ?? brand;
  const frozen = Object.freeze({
    ...config,
    fonts: config.fonts && {
      ...config.fonts,
      symbols: config.fonts.symbols ?? DEFAULT_SYMBOLS,
    },
  });
  return {
    config: frozen,
    app,
    get product() {
      return {
        id: config.id,
        name: config.name,
        icon: asset(config.icons.app),
        privacyUrl: config.links?.privacy ?? '',
        codeOfConductUrl: config.links?.codeOfConduct ?? '',
      };
    },
    palettes,
    defaultPalette,
    typefaces: {brand: stack(brand), plain: stack(plain)},
    asset,
    setAssetBase(next: string) {
      base = next.endsWith('/') ? next : `${next}/`;
    },
  };
};
