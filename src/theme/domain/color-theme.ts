/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Material 3 color schemes from one source color. Pure: no DOM, no storage.
 *
 * Colors are generated with Material Color Utilities, the library Android's
 * dynamic color uses, so a page and an app given the same source color get
 * the same roles.
 */

import {
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeContent,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';

/** Light, dark, or whichever the visitor's system asks for. */
export type ColorMode = 'light' | 'dark' | 'system';

export const COLOR_MODES: readonly ColorMode[] = ['light', 'dark', 'system'];

/**
 * How the source color spreads across the roles: `tonal-spot` is Android's
 * default, `content` keeps the source color as primary, `vibrant` pushes
 * chroma.
 */
export type ColorVariant = 'tonal-spot' | 'content' | 'vibrant';

export const COLOR_VARIANTS: readonly ColorVariant[] = [
  'tonal-spot',
  'content',
  'vibrant',
];

/** Material's baseline purple. */
export const DEFAULT_SOURCE_COLOR = '#6750a4';

/** The HCT ranges the sliders cover. */
export const HCT_RANGES = {hue: 360, chroma: 150, tone: 100} as const;

export type HctChannel = keyof typeof HCT_RANGES;

export interface HctColor {
  hue: number;
  chroma: number;
  tone: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#rrggbb` in lower case, or `undefined` for anything that is not a hex color. */
export const normalizeHex = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const match = HEX.exec(value.trim());
  if (!match) return undefined;
  const digits =
    match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  return `#${digits.toLowerCase()}`;
};

export const isColorMode = (value: unknown): value is ColorMode =>
  (COLOR_MODES as readonly unknown[]).includes(value);

export const isColorVariant = (value: unknown): value is ColorVariant =>
  (COLOR_VARIANTS as readonly unknown[]).includes(value);

export const hctFromHex = (hex: string): HctColor => {
  const hct = Hct.fromInt(argbFromHex(normalizeHex(hex) ?? '#000000'));
  return {hue: hct.hue, chroma: hct.chroma, tone: hct.tone};
};

/** The sRGB color nearest to the HCT one; chroma clips to what sRGB can show. */
export const hexFromHct = ({hue, chroma, tone}: HctColor) =>
  hexFromArgb(Hct.from(hue, chroma, tone).toInt());

const SCHEMES: Record<
  ColorVariant,
  new (source: Hct, isDark: boolean, contrast: number) => DynamicScheme
> = {
  'tonal-spot': SchemeTonalSpot,
  content: SchemeContent,
  vibrant: SchemeVibrant,
};

/** Every role a Material Web component reads, as `--md-sys-color-<role>`. */
export const COLOR_ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'surface-tint',
  'inverse-surface',
  'inverse-on-surface',
  'outline',
  'outline-variant',
  'shadow',
  'scrim',
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];

/** `on-primary-container` to `onPrimaryContainer`, the name MCU uses. */
const methodName = (role: string) =>
  role.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

// MCU 0.3 exposes the roles as static DynamicColors. (0.4's ESM build has
// extensionless imports that Node cannot load, so the package stays on 0.3.)
const DYNAMIC_COLORS = MaterialDynamicColors as unknown as Record<
  string,
  {getArgb(scheme: DynamicScheme): number}
>;

export interface ColorSchemeOptions {
  dark?: boolean;
  variant?: ColorVariant;
  /** -1 (reduced) to 1 (high); 0 is standard. */
  contrast?: number;
}

/** Every color role, as `#rrggbb`, for one source color. */
export const colorScheme = (
  sourceColor: string,
  {dark = false, variant = 'tonal-spot', contrast = 0}: ColorSchemeOptions = {}
): Record<ColorRole, string> => {
  const source = Hct.fromInt(
    argbFromHex(normalizeHex(sourceColor) ?? DEFAULT_SOURCE_COLOR)
  );
  const scheme = new SCHEMES[variant](source, dark, contrast);
  return Object.fromEntries(
    COLOR_ROLES.map((role) => [
      role,
      hexFromArgb(DYNAMIC_COLORS[methodName(role)].getArgb(scheme)),
    ])
  ) as Record<ColorRole, string>;
};

const declarations = (scheme: Record<string, string>) =>
  Object.entries(scheme)
    .map(([role, hex]) => `--md-sys-color-${role}: ${hex};`)
    .join(' ');

export interface ColorTheme {
  sourceColor: string;
  mode: ColorMode;
  variant?: ColorVariant;
  contrast?: number;
}

/**
 * The CSS for a theme: the roles as custom properties on `selector`, and
 * `color-scheme`. `system` gives light roles and dark ones under
 * `prefers-color-scheme: dark`.
 */
export const colorThemeCss = (
  {sourceColor, mode, variant, contrast}: ColorTheme,
  selector = ':root'
) => {
  const block = (dark: boolean) =>
    `${selector} { color-scheme: ${dark ? 'dark' : 'light'}; ${declarations(
      colorScheme(sourceColor, {dark, variant, contrast})
    )} }`;
  if (mode !== 'system') return block(mode === 'dark');
  return `${block(false)}\n@media (prefers-color-scheme: dark) { ${block(true)} }`;
};
