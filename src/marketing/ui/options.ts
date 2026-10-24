/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {NavType, ThemeChoice} from '../domain/preview-settings.js';
import type {WindowName} from '../domain/windows.js';

/** [value, label, Material Symbols icon], shared by every hub control. */
export type Option<T extends string> = readonly [
  value: T,
  label: string,
  icon: string,
];

export const NAV_ICONS: Record<NavType, string> = {
  gesture: 'swipe_up',
  buttons: 'more_horiz',
};

export const THEME_OPTIONS: ReadonlyArray<Option<ThemeChoice>> = [
  ['system', 'System', 'brightness_auto'],
  ['light', 'Light', 'light_mode'],
  ['dark', 'Dark', 'dark_mode'],
];

export const NAV_OPTIONS: ReadonlyArray<Option<NavType>> = [
  ['gesture', 'Gesture', NAV_ICONS.gesture],
  ['buttons', '3-button', NAV_ICONS.buttons],
];

export const WINDOW_OPTIONS: ReadonlyArray<Option<WindowName>> = [
  ['phone', 'Phone', 'smartphone'],
  ['fold', 'Fold', 'devices_fold'],
  ['desktop', 'Desktop', 'desktop_windows'],
];
