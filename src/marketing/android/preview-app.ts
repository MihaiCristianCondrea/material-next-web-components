/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  shellLayout,
  type ShellLayout,
  type ShellMode,
} from '../domain/windows.js';
import type {WindowSpec} from '../domain/windows.js';

/**
 * A Material Symbol by name. `rounded` draws it from Material Symbols Rounded instead of Outlined.
 */
export interface PreviewIcon {
  name: string;
  rounded?: boolean;
}

export type PreviewIconInput = string | PreviewIcon;

/** One tab of the app's primary navigation (App Toolkit `ShellGraph.tab`). */
export interface PreviewTab {
  id: string;
  label: string;
  /** Shown in the collapsed rail when `label` is too long for it. */
  shortLabel?: string;
  icon: PreviewIconInput;
  /** Drawn while the tab is selected; defaults to `icon`, filled. */
  selectedIcon?: PreviewIconInput;
  /** A badge on the tab: text, or `''` for a dot. */
  badge?: string;
  /** The marketing screen the tab opens, with its state. Defaults to the tab's id. */
  screen?: string;
  screenState?: Record<string, unknown>;
}

/**
 * A drawer or overflow entry (`DrawerEntry.Link` / `DrawerEntry.Action`). An entry without
 * `screen` or `href` opens a page the preview does not draw: it is drawn like the app draws it and
 * only closes the navigation, and `previewOnly` says so to assistive technology.
 */
export interface PreviewEntry {
  id: string;
  label: string;
  icon: PreviewIconInput;
  /** A marketing screen the entry opens. */
  screen?: string;
  screenState?: Record<string, unknown>;
}

/** The app's preview declaration: one per app, shared by every screen. */
export interface PreviewAppConfig {
  /** The app's name, in the drawer header and the expanded rail. */
  name: string;
  /** The app's mark, an image URL, drawn at the title's line height. */
  logo?: string;
  tabs: PreviewTab[];
  drawer?: {
    /** Entries under the tabs (the drawer's top section). */
    entries?: PreviewEntry[];
    /** Entries pinned to the bottom edge (`toolkitFooter()`). */
    footer?: PreviewEntry[];
  };
  /** The app bar's overflow menu on tab roots. No entries: no overflow button. */
  overflow?: PreviewEntry[];
}

export interface PreviewApp {
  readonly config: Readonly<PreviewAppConfig>;
  tab(id: string | undefined): PreviewTab | undefined;
}

/** Validates and freezes an app declaration. */
export const definePreviewApp = (config: PreviewAppConfig): PreviewApp => {
  if (!config.tabs.length)
    throw new Error('A preview app needs at least one tab.');
  const ids = new Set<string>();
  for (const entry of [
    ...config.tabs,
    ...(config.drawer?.entries ?? []),
    ...(config.drawer?.footer ?? []),
    ...(config.overflow ?? []),
  ]) {
    if (ids.has(entry.id))
      throw new Error(`Duplicate preview entry id "${entry.id}"`);
    ids.add(entry.id);
  }
  const frozen = Object.freeze({...config});
  return {
    config: frozen,
    tab: (id) => frozen.tabs.find((t) => t.id === id),
  };
};

export const iconOf = (icon: PreviewIconInput): PreviewIcon =>
  typeof icon === 'string' ? {name: icon} : icon;

/**
 * Where the destination sits (`DestinationKind`): a tab's `root`; a `child` pushed onto the tab,
 * which keeps the navigation bar; or a `page` (settings, help, anything the drawer opens), which
 * covers the navigation bar on a phone and opens beside the rail or drawer on wider windows. Both
 * show Back.
 */
export type PreviewDestinationKind = 'root' | 'child' | 'page';

/** The navigation UI the preview remembers between renders. */
export interface PreviewNavigationState {
  /** The modal drawer (bottom bar layout). */
  drawerOpen?: boolean;
  /** The expanded rail layout's rail, open with labels or collapsed. */
  railExpanded?: boolean;
  /** The rail layout's modal rail over the content. */
  railOpen?: boolean;
  /** The app bar's overflow menu. */
  overflowOpen?: boolean;
}

/** What the app bar's leading button does. */
export type PreviewNavButton = 'menu' | 'back' | null;

/** What the rail's header button does. */
export type PreviewRailButton = 'expand' | 'collapse' | null;

/**
 * Everything the shell draws for one destination in one window, derived from the layout policy
 * so no screen decides it (ShellChrome.kt, ShellFrame.kt):
 *
 * | Layout | Navigation | App bar button on a root | Rail button |
 * | --- | --- | --- | --- |
 * | bottomBar (< 600 dp) | navigation bar, modal drawer | menu: opens the drawer | none |
 * | rail (600 dp) | collapsed rail | none | expand: opens the modal rail |
 * | expandedRail (840 dp) | rail, collapsed or expanded | none | expand / collapse |
 * | permanentDrawer (1200 dp) | permanent drawer with the tabs | none | none |
 *
 * A child or page shows Back in every layout and names itself. A tab's root names the app, until
 * the navigation beside it names the app (an expanded rail, the permanent drawer): then it names
 * the tab. A root marks its tab in the navigation; a child or page marks none.
 */
export interface PreviewChrome {
  layout: ShellLayout;
  mode: ShellMode;
  navButton: PreviewNavButton;
  railButton: PreviewRailButton;
  /** The rail is drawn with labels beside it (expanded rail layout, expanded). */
  railExpanded: boolean;
  /** The modal drawer can open in this layout, and is open. */
  drawerOpen: boolean;
  /** The rail layout's modal rail is open. */
  railOpen: boolean;
  /** The tab drawn as selected, or null while a child or page covers its root. */
  selectedTab: string | null;
  /** What the app bar names by default: the app, the tab, or the destination itself. */
  titleSource: 'app' | 'tab' | 'destination';
  overflow: boolean;
  overflowOpen: boolean;
  /** The navigation beside the content names the app. */
  navigationNamesApp: boolean;
  /**
   * Bottom insets in dp: the navigation bar (80, under roots and children on a phone) and the
   * system navigation (24 gesture, 48 buttons).
   */
  bottomBar: number;
  systemNav: number;
}

export const previewChrome = (
  app: PreviewApp,
  {
    window,
    kind = 'root',
    navType = 'gesture',
    navigation = {},
    tab,
  }: {
    window?: string | WindowSpec | null;
    kind?: PreviewDestinationKind;
    navType?: 'gesture' | 'buttons';
    navigation?: PreviewNavigationState;
    /** The tab the destination belongs to. */
    tab?: string;
  } = {}
): PreviewChrome => {
  const layout = shellLayout(window);
  const {mode} = layout;
  const root = kind === 'root';
  const railExpanded =
    mode === 'expandedRail' && Boolean(navigation.railExpanded);
  const navigationNamesApp = mode === 'permanentDrawer' || railExpanded;
  // The overflow is the app's (ShellGraph.overflow), beside any destination actions.
  const overflow = root && Boolean(app.config.overflow?.length);
  return {
    layout,
    mode,
    navButton: !root ? 'back' : mode === 'bottomBar' ? 'menu' : null,
    railButton:
      mode === 'rail'
        ? 'expand'
        : mode === 'expandedRail'
          ? railExpanded
            ? 'collapse'
            : 'expand'
          : null,
    railExpanded,
    drawerOpen: mode === 'bottomBar' && Boolean(navigation.drawerOpen),
    railOpen: mode === 'rail' && Boolean(navigation.railOpen),
    selectedTab: root ? (app.tab(tab)?.id ?? null) : null,
    titleSource: !root ? 'destination' : navigationNamesApp ? 'tab' : 'app',
    overflow,
    overflowOpen: overflow && Boolean(navigation.overflowOpen),
    navigationNamesApp,
    bottomBar: mode === 'bottomBar' && kind !== 'page' ? 80 : 0,
    systemNav: layout.systemNav ? (navType === 'buttons' ? 48 : 24) : 0,
  };
};
