/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Browser facts the elements and stores share. Internal: not a package
 * export. Every call is safe outside a browser and where the platform throws.
 */

/** The parts of Web Storage the library's stores use. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** `localStorage`, or `undefined` where it is missing or refused. */
export const safeLocalStorage = (): KeyValueStorage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    // Storage can throw in private windows or sandboxed frames.
    return undefined;
  }
};

/** The visitor asked for reduced motion. */
export const prefersReducedMotion = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
