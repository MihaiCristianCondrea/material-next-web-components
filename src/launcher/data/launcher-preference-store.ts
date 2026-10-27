/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  safeLocalStorage,
  type KeyValueStorage,
} from '../../internal/environment.js';
import {normalizeFavoriteIds} from '../domain/launcher-catalog.js';
import type {LauncherItemId} from '../domain/launcher-item.js';

export type {KeyValueStorage};

/** Where a visitor's favorites persist. A launcher works the same without it. */
export interface LauncherPreferenceStore {
  /** The stored favorites, or the defaults when nothing usable is stored. */
  load(): LauncherItemId[];
  save(favoriteIds: readonly LauncherItemId[]): void;
  /** Forgets the stored list; the next load() gives the defaults. */
  reset(): void;
  /** Calls `listener` when another tab saves. Returns the unsubscribe call. */
  subscribe(listener: (favoriteIds: LauncherItemId[]) => void): () => void;
}

export const DEFAULT_LAUNCHER_STORAGE_KEY = 'mnw-launcher:favorites';

const VERSION = 1;

/** Reads `{version, favoriteIds}`, the older `{favoriteIds}` or a bare list. */
const parse = (raw: string): unknown => {
  const value: unknown = JSON.parse(raw);
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && 'favoriteIds' in value) {
    return (value as {favoriteIds: unknown}).favoriteIds;
  }
  return undefined;
};

/**
 * Keeps favorites as versioned JSON under one key, so every product served
 * from the same origin shares the list. Corrupt values give the defaults;
 * unavailable storage keeps the list in memory for this page.
 */
export const createLauncherPreferenceStore = ({
  defaults,
  key = DEFAULT_LAUNCHER_STORAGE_KEY,
  storage = safeLocalStorage(),
  migrate,
}: {
  defaults: readonly LauncherItemId[];
  key?: string;
  storage?: KeyValueStorage;
  /** Maps ids from an older scheme (`github-profile`) to current ones. */
  migrate?: (id: string) => string | undefined;
}): LauncherPreferenceStore => {
  let memory: LauncherItemId[] | undefined;
  const read = (raw: string | null) => {
    try {
      return raw === null
        ? [...defaults]
        : normalizeFavoriteIds(parse(raw), defaults, migrate);
    } catch {
      return [...defaults];
    }
  };
  return {
    load() {
      if (!storage) return [...(memory ?? defaults)];
      try {
        return read(storage.getItem(key));
      } catch {
        return [...(memory ?? defaults)];
      }
    },
    save(favoriteIds) {
      memory = normalizeFavoriteIds([...favoriteIds], defaults);
      try {
        storage?.setItem(
          key,
          JSON.stringify({version: VERSION, favoriteIds: memory})
        );
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
