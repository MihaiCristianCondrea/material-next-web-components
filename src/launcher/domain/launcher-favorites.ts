/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {MAX_FAVORITES, type LauncherCatalog} from './launcher-catalog.js';
import {
  normalizeHref,
  type LauncherItem,
  type LauncherItemId,
} from './launcher-item.js';

/**
 * Which entries a page shows, and the edits a visitor makes to favorites.
 * Every operation takes and returns the full favorites list, hidden entries
 * included, so a favorite hidden on one page is still there on the next.
 */

export interface LauncherContext {
  /**
   * The product this page belongs to: an item id (`web:material-next`) or a
   * product name shared by several entries (`material-next`).
   */
  currentProduct?: string;
  /**
   * This page's URL. A web product or console whose URL contains it is hidden
   * too, so a page never offers a link to itself.
   */
  currentUrl?: string;
  /** More ids or product names to hide on this page. */
  exclude?: readonly string[];
}

export interface LauncherView {
  /** Favorites to show, in order. */
  favorites: LauncherItem[];
  /** Admin redirects to show, in order. */
  redirects: LauncherItem[];
  /** Entries in neither list, offered while editing. */
  available: LauncherItem[];
  /** Favorites kept but not shown here: excluded, or unknown to this catalog. */
  hiddenFavoriteIds: LauncherItemId[];
}

/** Whether the context hides this entry. */
export const isExcluded = (
  item: LauncherItem,
  {currentProduct, currentUrl, exclude = []}: LauncherContext
) => {
  const names = currentProduct ? [currentProduct, ...exclude] : exclude;
  if (names.some((name) => name === item.id || name === item.product)) {
    return true;
  }
  if (!currentUrl) return false;
  const page = normalizeHref(currentUrl);
  const href = normalizeHref(item.href, currentUrl);
  if (!page || !href) return false;
  if (page === href) return true;
  // Web products and consoles own the pages under them; a profile or a
  // shortcut does not (a repository is not the profile it lives under).
  const path = (url: string) => url.replace(/\?.*$/, '');
  return (
    (item.kind === 'web' || item.kind === 'console') &&
    `${path(page)}/`.startsWith(`${path(href)}/`)
  );
};

export const resolveLauncher = (
  catalog: LauncherCatalog,
  favoriteIds: readonly LauncherItemId[],
  context: LauncherContext = {}
): LauncherView => {
  const shown = new Map(
    catalog.items
      .filter((item) => !isExcluded(item, context))
      .map((item) => [item.id, item])
  );
  const favorites: LauncherItem[] = [];
  const hiddenFavoriteIds: LauncherItemId[] = [];
  for (const id of new Set(favoriteIds)) {
    const item = shown.get(id);
    if (item) favorites.push(item);
    else hiddenFavoriteIds.push(id);
  }
  const redirects = catalog.redirects.flatMap((id) => shown.get(id) ?? []);
  const listed = new Set<string>([...favoriteIds, ...catalog.redirects]);
  return {
    favorites,
    redirects,
    available: [...shown.values()].filter((item) => !listed.has(item.id)),
    hiddenFavoriteIds,
  };
};

/** Adds `id` at the end, unless it is already a favorite or the list is full. */
export const addFavorite = (
  ids: readonly LauncherItemId[],
  id: LauncherItemId
): LauncherItemId[] =>
  ids.includes(id) || ids.length >= MAX_FAVORITES ? [...ids] : [...ids, id];

export const removeFavorite = (
  ids: readonly LauncherItemId[],
  id: LauncherItemId
): LauncherItemId[] => ids.filter((other) => other !== id);

/**
 * Moves a visible favorite to `toIndex` among the visible ones. Hidden
 * favorites keep their slots, so the order on other pages stays as it was.
 */
export const moveFavorite = (
  ids: readonly LauncherItemId[],
  id: LauncherItemId,
  toIndex: number,
  visible: readonly LauncherItemId[]
): LauncherItemId[] => {
  const shown = new Set(visible);
  if (!shown.has(id) || !ids.includes(id)) return [...ids];
  const order = ids.filter((other) => shown.has(other) && other !== id);
  order.splice(Math.max(0, Math.min(toIndex, order.length)), 0, id);
  let next = 0;
  return ids.map((other) => (shown.has(other) ? order[next++] : other));
};
