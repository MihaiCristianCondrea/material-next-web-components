/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  safeLocalStorage,
  type KeyValueStorage,
} from '../../internal/environment.js';
import {
  DEFAULT_PREVIEW_SETTINGS,
  sanitizeSettings,
  type PreviewSettings,
} from '../domain/preview-settings.js';

/** Where preview settings persist. A hub works the same without it. */
export interface PreviewSettingsStore {
  load(): PreviewSettings;
  save(settings: PreviewSettings): void;
}

/**
 * Stores settings per product, so two hubs served from the same origin
 * (localhost:5173) keep their own choices. Unknown or stale values fall back
 * to the defaults.
 */
export const createPreviewSettingsStore = ({
  productId,
  palettes,
  defaults = DEFAULT_PREVIEW_SETTINGS,
  storage = safeLocalStorage(),
}: {
  productId: string;
  palettes: readonly string[];
  defaults?: PreviewSettings;
  storage?: Pick<KeyValueStorage, 'getItem' | 'setItem'>;
}): PreviewSettingsStore => {
  const key = `mnw-marketing:${productId}:preview`;
  let memory: PreviewSettings = {...defaults};
  return {
    load() {
      try {
        const raw = storage?.getItem(key);
        if (raw)
          memory = sanitizeSettings(JSON.parse(raw), {palettes, defaults});
      } catch {
        // Corrupt or unavailable storage: keep the last known settings.
      }
      return {...memory};
    },
    save(settings) {
      memory = {...settings};
      try {
        storage?.setItem(key, JSON.stringify(settings));
      } catch {
        // Quota or privacy mode: the in-memory copy still serves this page.
      }
    },
  };
};
