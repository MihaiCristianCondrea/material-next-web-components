/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  isLauncherItemId,
  launcherItem,
  normalizeHref,
  type LauncherItem,
  type LauncherItemId,
  type LauncherItemInput,
} from './launcher-item.js';

/**
 * Everything a launcher can show, and how it starts out. Favorites are the
 * personal, editable list; redirects are a fixed list of admin destinations
 * that stays its own section and can be copied into favorites.
 */
export interface LauncherCatalog {
  readonly items: readonly LauncherItem[];
  /** The favorites a new visitor (or a reset) gets, in order. */
  readonly defaultFavorites: readonly LauncherItemId[];
  /** The admin redirects section, in order. Never edited by the visitor. */
  readonly redirects: readonly LauncherItemId[];
}

/** The most favorites kept, visible and hidden together. */
export const MAX_FAVORITES = 48;

/**
 * Builds a catalog. Entries are deduplicated by id and by URL (the first one
 * wins), and favorite and redirect ids that name no entry are dropped.
 */
export const createLauncherCatalog = ({
  items,
  defaultFavorites = [],
  redirects = [],
}: {
  items: ReadonlyArray<LauncherItem | LauncherItemInput>;
  defaultFavorites?: readonly string[];
  redirects?: readonly string[];
}): LauncherCatalog => {
  const ids = new Set<string>();
  const hrefs = new Set<string>();
  const unique: LauncherItem[] = [];
  for (const input of items) {
    const item = 'id' in input ? input : launcherItem(input);
    const href = normalizeHref(item.href);
    if (ids.has(item.id) || (href && hrefs.has(href))) continue;
    ids.add(item.id);
    if (href) hrefs.add(href);
    unique.push(item);
  }
  const known = (list: readonly string[]) =>
    [...new Set(list)].filter((id): id is LauncherItemId => ids.has(id));
  return {
    items: unique,
    defaultFavorites: known(defaultFavorites),
    redirects: known(redirects),
  };
};

export const findLauncherItem = (catalog: LauncherCatalog, id: string) =>
  catalog.items.find((item) => item.id === id);

/**
 * A stored favorites list made safe: well-formed, unique ids, at most
 * MAX_FAVORITES. Ids this catalog does not have are kept, because another
 * page's catalog may have them; only malformed values are dropped. Anything
 * that is not a list gives the defaults.
 */
export const normalizeFavoriteIds = (
  value: unknown,
  fallback: readonly LauncherItemId[],
  migrate?: (id: string) => string | undefined
): LauncherItemId[] => {
  if (!Array.isArray(value)) return [...fallback];
  const ids = value
    .map((id) => (typeof id === 'string' ? (migrate?.(id) ?? id) : id))
    .filter(isLauncherItemId);
  return [...new Set(ids)].slice(0, MAX_FAVORITES);
};
