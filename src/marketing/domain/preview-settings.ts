/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type NavType = 'gesture' | 'buttons';

/** The hub-wide preview choices: every card follows them unless overridden. */
export interface PreviewSettings {
  theme: ThemeChoice;
  navType: NavType;
  /** A palette name, or "captured" for each screen's reference palette. */
  palette: string;
  deviceFrame: boolean;
}

export const CAPTURED_PALETTE = 'captured';

export const THEME_CHOICES: readonly ThemeChoice[] = [
  'system',
  'light',
  'dark',
];
export const NAV_TYPES: readonly NavType[] = ['gesture', 'buttons'];

export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = {
  theme: 'system',
  navType: 'gesture',
  palette: CAPTURED_PALETTE,
  deviceFrame: false,
};

/**
 * Keeps only values the hub can show: a stored or linked setting from an older
 * hub (a removed palette, a typo in a URL) falls back to the default.
 */
export const sanitizeSettings = (
  input: Partial<Record<keyof PreviewSettings, unknown>> | null | undefined,
  {
    palettes,
    defaults = DEFAULT_PREVIEW_SETTINGS,
  }: {palettes: readonly string[]; defaults?: PreviewSettings}
): PreviewSettings => {
  const out = {...defaults};
  if (!input) return out;
  if (THEME_CHOICES.includes(input.theme as ThemeChoice)) {
    out.theme = input.theme as ThemeChoice;
  }
  if (NAV_TYPES.includes(input.navType as NavType)) {
    out.navType = input.navType as NavType;
  }
  if (
    typeof input.palette === 'string' &&
    (input.palette === CAPTURED_PALETTE || palettes.includes(input.palette))
  ) {
    out.palette = input.palette;
  }
  if (typeof input.deviceFrame === 'boolean') {
    out.deviceFrame = input.deviceFrame;
  }
  return out;
};

export const settingsEqual = (a: PreviewSettings, b: PreviewSettings) =>
  a.theme === b.theme &&
  a.navType === b.navType &&
  a.palette === b.palette &&
  a.deviceFrame === b.deviceFrame;

/** "system" follows the OS; the rest are taken as they are. */
export const resolveTheme = (
  theme: ThemeChoice,
  systemPrefersDark: boolean
): ResolvedTheme =>
  theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

/** The palette a screen renders with: its own for "captured", or the chosen one. */
export const resolvePalette = (
  palette: string,
  screenPalette: string | undefined
): string | undefined =>
  palette === CAPTURED_PALETTE ? screenPalette : palette;

export const paletteLabel = (palette: string) =>
  palette === CAPTURED_PALETTE
    ? 'As captured'
    : palette
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
