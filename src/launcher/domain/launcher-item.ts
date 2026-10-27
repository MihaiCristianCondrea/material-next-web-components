/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * What a launcher entry is. Pure: no DOM, no storage.
 *
 * An entry's id is `kind:key`, so an Android app and the web page about it can
 * share a key without colliding, and a stored favorite keeps pointing at the
 * same entry when titles, URLs or icons change.
 */

/** The four things a launcher opens. */
export const LAUNCHER_ITEM_KINDS = [
  'android-app',
  'web',
  'console',
  'shortcut',
] as const;

export type LauncherItemKind = (typeof LAUNCHER_ITEM_KINDS)[number];

/** `kind:key`, for example `android-app:smart-cleaner` or `console:play`. */
export type LauncherItemId = `${LauncherItemKind}:${string}`;

export interface LauncherItemInput {
  kind: LauncherItemKind;
  /** Stable within its kind: lowercase letters, digits, dots and dashes. */
  key: string;
  title: string;
  href: string;
  /** A short second line, for example the package name or the host. */
  subtitle?: string;
  /** A Material Symbols name, shown when there is no image. */
  icon?: string;
  /**
   * An image URL, or `asset:launcher/<file>.svg` for an icon shipped in
   * `assets/marketing/` (resolved with marketingAsset() when rendered).
   *
   * The launcher draws the tile; the image is only the mark, contained in a
   * 40px square. SVG is best, then PNG or WebP: transparent, with no border,
   * background or tile of its own, and cropped close to the artwork (a wide
   * logo keeps its proportions inside the square).
   */
  image?: string;
  /** The image is a single dark colour that should invert in dark themes. */
  monochrome?: boolean;
  /** Defaults to `_blank` for other origins and `_self` for this one. */
  target?: '_self' | '_blank';
  /**
   * The product this entry belongs to. Entries that share a product (its app,
   * its site, its console) are all hidden on that product's own pages.
   */
  product?: string;
}

export interface LauncherItem extends LauncherItemInput {
  readonly id: LauncherItemId;
}

const KEY = /^[a-z0-9][a-z0-9.-]*$/;

export const launcherItemId = (
  kind: LauncherItemKind,
  key: string
): LauncherItemId => `${kind}:${key}`;

/** A well-formed id, whether or not any catalog has it. */
export const isLauncherItemId = (value: unknown): value is LauncherItemId => {
  if (typeof value !== 'string') return false;
  const split = value.indexOf(':');
  if (split < 0) return false;
  return (
    (LAUNCHER_ITEM_KINDS as readonly string[]).includes(
      value.slice(0, split)
    ) && KEY.test(value.slice(split + 1))
  );
};

/** Builds an entry, rejecting keys that would make unstable ids. */
export const launcherItem = (input: LauncherItemInput): LauncherItem => {
  if (!KEY.test(input.key)) {
    throw new Error(`Launcher key "${input.key}" must match ${KEY}`);
  }
  return {...input, id: launcherItemId(input.kind, input.key)};
};

/**
 * `https://host/path?query` in lower case, without the hash or a trailing
 * slash, or `''`. The query stays: Play listings differ only in `?id=`.
 */
export const normalizeHref = (href: string, base?: string) => {
  try {
    const url = new URL(href, base);
    const path = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${path}${url.search}`.toLowerCase();
  } catch {
    return '';
  }
};
