/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * How an app shell lays out its navigation at a given width. Pure: no DOM.
 *
 * A policy is a list of rules, each starting at a width; the widest rule that
 * fits wins. Two modes exist today, a modal drawer and a permanent drawer;
 * the rule list leaves room for a rail or a bottom bar without changing how
 * policies are written or read.
 */

export const APP_SHELL_NAVIGATION_MODES = ['modal', 'permanent'] as const;

export type AppShellNavigationMode =
  (typeof APP_SHELL_NAVIGATION_MODES)[number];

export interface AppShellLayoutRule {
  /** The narrowest width, in CSS pixels, this rule applies to. */
  readonly from: number;
  readonly mode: AppShellNavigationMode;
}

export interface AppShellLayoutPolicy {
  /** Sorted by `from`, the first starting at 0. */
  readonly rules: readonly AppShellLayoutRule[];
}

/** Android Insider's admin console: a modal drawer below 900px. */
export const DEFAULT_PERMANENT_DRAWER_FROM = 900;

/**
 * A modal drawer below `permanentFrom`, a permanent drawer from it. Android
 * Insider uses 900 (the default), the apps metadata console 800.
 */
export const appShellLayoutPolicy = ({
  permanentFrom = DEFAULT_PERMANENT_DRAWER_FROM,
}: {permanentFrom?: number} = {}): AppShellLayoutPolicy =>
  createLayoutPolicy([
    {from: 0, mode: 'modal'},
    {from: permanentFrom, mode: 'permanent'},
  ]);

/** Checks and sorts rules: widths are finite and non-negative, modes known. */
export const createLayoutPolicy = (
  rules: readonly AppShellLayoutRule[]
): AppShellLayoutPolicy => {
  for (const rule of rules) {
    if (!Number.isFinite(rule.from) || rule.from < 0) {
      throw new Error(`Layout rule width must be 0 or more, got ${rule.from}`);
    }
    if (!APP_SHELL_NAVIGATION_MODES.includes(rule.mode)) {
      throw new Error(`Unknown navigation mode "${rule.mode}"`);
    }
  }
  const sorted = [...rules].sort((a, b) => a.from - b.from);
  if (sorted[0]?.from !== 0) {
    sorted.unshift({from: 0, mode: sorted[0]?.mode ?? 'modal'});
  }
  return {rules: sorted};
};

export const DEFAULT_APP_SHELL_POLICY = appShellLayoutPolicy();

/** The mode for a width: the last rule whose `from` it reaches. */
export const resolveNavigationMode = (
  width: number,
  policy: AppShellLayoutPolicy = DEFAULT_APP_SHELL_POLICY
): AppShellNavigationMode => {
  let mode = policy.rules[0]?.mode ?? 'modal';
  for (const rule of policy.rules) {
    if (width >= rule.from) mode = rule.mode;
  }
  return mode;
};
