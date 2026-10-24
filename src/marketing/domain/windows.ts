/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Window sizes and the adaptive shell rules of App Toolkit for Android, which
 * every hub app is built on. The Android sources stay the reference: change
 * those first, then these.
 *
 *  - App Toolkit navigation/layout/ShellLayout.kt: ShellLayoutPolicy, ShellLayoutInfo
 *  - App Toolkit shell/chrome/NavigationSurfaces.kt: rail and drawer widths
 *  - App Toolkit ListDetailScene.kt: list fraction and separator
 */

export type DeviceName = 'pixel_9_pro_xl' | 'pixel_9_pro_fold' | 'pixelbook_go';
export type WindowSystem = 'phone' | 'desktop';

export interface WindowSpec {
  width: number;
  height: number;
  /** "phone" draws the status bar and system navigation; "desktop" neither. */
  system: WindowSystem;
  /** The device frame drawn around this window. */
  device?: DeviceName;
}

/** ShellLayoutPolicy defaults: Material's window size class breakpoints. */
export const SHELL_POLICY = {
  railFrom: 600,
  expandedRailFrom: 840,
  permanentDrawerFrom: 1200,
  listDetailFrom: 600,
  largeTopBarFrom: 480,
} as const;

/** CollapsedRailWidth, ExpandedRailWidth and PermanentDrawerWidth. */
export const NAV_WIDTHS = {
  rail: 96,
  expandedRail: 280,
  permanentDrawer: 300,
} as const;

/** ListDetailScene.kt: the list rests at 38% of the panes, after a 24 dp separator. */
export const LIST_DETAIL = {listFraction: 0.38, separator: 24} as const;

/** The windows hubs draw, in dp (1 dp = 1 CSS px). */
export const WINDOWS = {
  /** Pixel 9 Pro XL: 1344 x 2992 px at 3.125. */
  phone: {width: 430, height: 957, system: 'phone', device: 'pixel_9_pro_xl'},
  /** Pixel 9 Pro Fold, open: 2076 x 2152 px at 2.4375. */
  fold: {width: 852, height: 883, system: 'phone', device: 'pixel_9_pro_fold'},
  /** A Chromebook window filling the Pixelbook Go's 1826 x 1079 px screen at 1.5. */
  desktop: {
    width: 1218,
    height: 720,
    system: 'desktop',
    device: 'pixelbook_go',
  },
} as const satisfies Record<string, WindowSpec>;

export type WindowName = keyof typeof WINDOWS;

export const WINDOW_NAMES = Object.keys(WINDOWS) as WindowName[];

/** `win` as given (a spec or a WINDOWS key), or the phone. */
export const windowOf = (win?: string | WindowSpec | null): WindowSpec =>
  (typeof win === 'string' ? WINDOWS[win as WindowName] : win) ?? WINDOWS.phone;

export type ShellMode =
  'bottomBar' | 'rail' | 'expandedRail' | 'permanentDrawer';

export interface ShellLayout extends WindowSpec {
  mode: ShellMode;
  /** A rail or the permanent drawer beside the content. */
  framed: boolean;
  navWidth: number;
  listDetail: boolean;
  allowsLargeTopBar: boolean;
  /** Status bar height in dp; 0 on desktop. */
  statusBar: number;
  /** Gesture navigation inset in dp; 0 on desktop. */
  systemNav: number;
}

/** ShellLayoutPolicy.resolve() for Auto, and the parts of ShellLayoutInfo screens read. */
export const shellLayout = (win?: string | WindowSpec | null): ShellLayout => {
  const w = windowOf(win);
  const mode: ShellMode =
    w.width >= SHELL_POLICY.permanentDrawerFrom
      ? 'permanentDrawer'
      : w.width >= SHELL_POLICY.expandedRailFrom
        ? 'expandedRail'
        : w.width >= SHELL_POLICY.railFrom
          ? 'rail'
          : 'bottomBar';
  // The expanded rail layout starts collapsed (ShellFrame.rememberShellFrameState).
  const navWidth =
    mode === 'permanentDrawer'
      ? NAV_WIDTHS.permanentDrawer
      : mode === 'bottomBar'
        ? 0
        : NAV_WIDTHS.rail;
  return {
    ...w,
    mode,
    framed: mode !== 'bottomBar',
    navWidth,
    listDetail: w.width >= SHELL_POLICY.listDetailFrom,
    allowsLargeTopBar: w.height >= SHELL_POLICY.largeTopBarFrom,
    statusBar: w.system === 'phone' ? 48 : 0,
    systemNav: w.system === 'phone' ? 24 : 0,
  };
};
