/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Which destination the current path belongs to. Pure: no DOM.
 *
 * A destination matches its own path and, unless it asks for an exact match,
 * every path under it (`/admin/apps` is current on `/admin/apps/com.example`).
 * When several match, the longest path wins, so `/admin` and `/admin/apps`
 * can both be destinations.
 */

export type DestinationMatch = 'prefix' | 'exact';

export interface Destination {
  /** A path or URL; only its path is compared. */
  href: string;
  match?: DestinationMatch;
}

/** `/a/b` from `https://x/a/b/?q#h` or `a/b/`: no trailing slash, `/` kept. */
export const destinationPath = (href: string, base = 'http://localhost/') => {
  try {
    const path = new URL(href, base).pathname.replace(/\/+$/, '');
    return path || '/';
  } catch {
    return '';
  }
};

const matches = (destination: Destination, path: string, base?: string) => {
  const own = destinationPath(destination.href, base);
  if (!own) return false;
  if (own === path) return true;
  if (destination.match === 'exact') return false;
  return own === '/' ? false : path.startsWith(`${own}/`);
};

/**
 * The index of the destination `activePath` belongs to, or -1. A root
 * destination (`/`) only matches the root itself, or every destination would
 * claim every path.
 */
export const findActiveDestination = (
  destinations: readonly Destination[],
  activePath: string,
  base?: string
): number => {
  // Explicit hash routes, such as #projects, are separate destinations even
  // though they share one document path. Ordinary path matching stays unchanged.
  if (activePath.startsWith('#')) {
    const current = new URL(activePath, base ?? 'http://localhost/');
    let best = -1;
    let longest = -1;
    destinations.forEach((destination, index) => {
      try {
        const target = new URL(destination.href, base ?? 'http://localhost/');
        if (
          target.origin !== current.origin ||
          target.pathname !== current.pathname ||
          !target.hash
        )
          return;
        const matches =
          target.hash === current.hash ||
          (destination.match !== 'exact' &&
            current.hash.startsWith(`${target.hash}/`));
        if (matches && target.hash.length > longest) {
          best = index;
          longest = target.hash.length;
        }
      } catch {
        /* Invalid destinations cannot be current. */
      }
    });
    return best;
  }
  const path = destinationPath(activePath, base);
  if (!path) return -1;
  let best = -1;
  let bestLength = -1;
  destinations.forEach((destination, index) => {
    if (!matches(destination, path, base)) return;
    const length = destinationPath(destination.href, base).length;
    if (length > bestLength) {
      best = index;
      bestLength = length;
    }
  });
  return best;
};
