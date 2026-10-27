/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {TemplateResult} from 'lit';
import type {NavType} from './preview-settings.js';
import type {WindowSpec} from './windows.js';

/** Any screen state. Each app's screens define their own fields. */
export type ScreenState = Record<string, unknown>;

/** What a screen's `render()` receives besides its own state. */
export interface ScreenRenderContext {
  /** Merges a patch into the state and renders again. Absent in videos. */
  set?: (patch: ScreenState | ((state: ScreenState) => ScreenState)) => void;
  /** Opens another screen. Absent in videos. */
  go?: (id: string, state?: ScreenState) => void;
  /** System navigation the frame draws. */
  navType: NavType;
  /** The window the screen lays itself out for (a WINDOWS key or a size). */
  window?: string | WindowSpec;
  /** Ad stand-ins. Off unless a reviewer asks for them. */
  showAds: boolean;
}

/** A tweak in the prototype panel. Mirrors the apps' existing `controls`. */
export type ScreenControl =
  | {
      type: 'presets';
      label: string;
      options: Array<[label: string, patch: ScreenState]>;
    }
  | {
      type: 'choice';
      key: string;
      label: string;
      options: Array<string | number>;
      patch?: ScreenState | ((value: unknown) => ScreenState);
    }
  | {
      type: 'toggle';
      key: string;
      label: string;
      patch?: ScreenState | ((value: unknown) => ScreenState);
    }
  | {
      type?: 'slider';
      key: string;
      label: string;
      min: number;
      max: number;
      step?: number;
      unit?: string;
      patch?: ScreenState | ((value: unknown) => ScreenState);
    };

/**
 * One app screen in the kit: a pure function of state, translated from its
 * Composable. The app owns these; the library only hosts them.
 */
export interface MarketingScreen<S extends ScreenState = ScreenState> {
  id: string;
  title: string;
  description: string;
  /** Group id for the catalog filter. */
  category?: string;
  /** Label for `category`; defaults to the id. */
  categoryLabel?: string;
  /** Palette of the reference capture, used by the "As captured" palette. */
  palette?: string;
  defaults: S;
  controls?: ScreenControl[];
  render(state: S & ScreenRenderContext): TemplateResult | unknown;
  /**
   * Optional clock: called every animation frame while the screen is visible.
   * Returns a patch to apply, or nothing. Videos never call it.
   */
  tick?(state: S, dt: number): Partial<S> | void | undefined;
}

/** An app's screens, in catalog order, with lookup by id. */
export interface ScreenRegistry {
  readonly screens: readonly MarketingScreen[];
  byId(id: string | null | undefined): MarketingScreen | undefined;
  /** Distinct categories in catalog order, with their labels. */
  categories(): Array<{id: string; label: string}>;
}

/** Builds a registry and rejects duplicate ids, which would make links ambiguous. */
export const createScreenRegistry = (
  screens: readonly MarketingScreen[]
): ScreenRegistry => {
  const index = new Map<string, MarketingScreen>();
  for (const screen of screens) {
    if (index.has(screen.id)) {
      throw new Error(`Duplicate screen id "${screen.id}"`);
    }
    index.set(screen.id, screen);
  }
  return {
    screens,
    byId: (id) => (id ? index.get(id) : undefined),
    categories: () => {
      const seen = new Map<string, string>();
      for (const s of screens) {
        if (s.category && !seen.has(s.category)) {
          seen.set(s.category, s.categoryLabel ?? s.category);
        }
      }
      return [...seen].map(([id, label]) => ({id, label}));
    },
  };
};
