/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  safeLocalStorage,
  type KeyValueStorage,
} from '../../internal/environment.js';
import {
  isColorMode,
  isColorVariant,
  normalizeHex,
  type ColorMode,
  type ColorVariant,
} from '../domain/color-theme.js';

/**
 * A visitor's theme. Without `sourceColor` the page keeps its own colors and
 * only the mode applies.
 */
export interface ThemePreference {
  sourceColor?: string;
  mode: ColorMode;
  variant?: ColorVariant;
}

/** Where a visitor's theme persists. The controls work the same without it. */
export interface ThemePreferenceStore {
  /** The stored theme, or `{mode: 'system'}` when nothing usable is stored. */
  load(): ThemePreference;
  save(preference: ThemePreference): void;
  /** Forgets the stored theme. */
  reset(): void;
  /** Calls `listener` when another tab saves. Returns the unsubscribe call. */
  subscribe(listener: (preference: ThemePreference) => void): () => void;
}

export const DEFAULT_THEME_STORAGE_KEY = 'mnw-theme';

const VERSION = 1;

const DEFAULT_PREFERENCE: ThemePreference = {mode: 'system'};

/** Keeps the fields that are valid and drops the rest. */
export const normalizeThemePreference = (value: unknown): ThemePreference => {
  if (!value || typeof value !== 'object') return {...DEFAULT_PREFERENCE};
  const {sourceColor, mode, variant} = value as Record<string, unknown>;
  const preference: ThemePreference = {
    mode: isColorMode(mode) ? mode : 'system',
  };
  const hex = normalizeHex(sourceColor);
  if (hex) preference.sourceColor = hex;
  if (isColorVariant(variant)) preference.variant = variant;
  return preference;
};

/**
 * Keeps the theme as versioned JSON under one key, so every page served from
 * the same origin shares it. Corrupt values give the default; unavailable
 * storage keeps the theme in memory for this page.
 */
export const createThemePreferenceStore = ({
  key = DEFAULT_THEME_STORAGE_KEY,
  storage = safeLocalStorage(),
}: {
  key?: string;
  storage?: KeyValueStorage;
} = {}): ThemePreferenceStore => {
  let memory: ThemePreference | undefined;
  const read = (raw: string | null) => {
    try {
      return raw === null
        ? {...DEFAULT_PREFERENCE}
        : normalizeThemePreference(JSON.parse(raw));
    } catch {
      return {...DEFAULT_PREFERENCE};
    }
  };
  return {
    load() {
      if (!storage) return {...(memory ?? DEFAULT_PREFERENCE)};
      try {
        return read(storage.getItem(key));
      } catch {
        return {...(memory ?? DEFAULT_PREFERENCE)};
      }
    },
    save(preference) {
      memory = normalizeThemePreference(preference);
      try {
        storage?.setItem(key, JSON.stringify({version: VERSION, ...memory}));
      } catch {
        // Quota or privacy mode: the in-memory copy still serves this page.
      }
    },
    reset() {
      memory = undefined;
      try {
        storage?.removeItem(key);
      } catch {
        // Nothing stored to forget.
      }
    },
    subscribe(listener) {
      if (typeof window === 'undefined') return () => {};
      const onStorage = (e: StorageEvent) => {
        if (e.key === key && e.storageArea === storage) {
          listener(read(e.newValue));
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    },
  };
};
