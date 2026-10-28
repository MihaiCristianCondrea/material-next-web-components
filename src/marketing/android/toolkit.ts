/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {PreviewEntry} from './preview-app.js';

/**
 * The App Toolkit library's own navigation entries, so every app built on it declares them as its
 * Kotlin graph does and they read the same in every preview. Their pages (settings, help, support)
 * are the library's, which the marketing previews do not draw: each entry only closes the
 * navigation, marked "Not part of this preview". An app that draws one passes its `screen`.
 */

/**
 * `toolkitFooter()` (ToolkitDrawer.kt): Settings, Help & feedback, Updates when the app has a
 * changelog, and Share, pinned to the bottom of the drawer and the rail.
 */
export const toolkitFooter = ({
  updates = true,
  screens = {},
}: {
  /** The app passes `onShowUpdates` (it has a changelog). */
  updates?: boolean;
  /** Marketing screens that draw these pages, by entry id. */
  screens?: Partial<Record<'settings' | 'help' | 'updates' | 'share', string>>;
} = {}): PreviewEntry[] => {
  const entries: PreviewEntry[] = [
    // The library draws Settings and Share with its own rounded drawables (anim_settings, anim_share).
    {id: 'settings', label: 'Settings', icon: {name: 'settings', rounded: true}},
    {id: 'help', label: 'Help & feedback', icon: 'help_outline'},
  ];
  if (updates)
    entries.push({id: 'updates', label: 'Updates', icon: 'event_note'});
  entries.push({id: 'share', label: 'Share', icon: {name: 'share', rounded: true}});
  return entries.map((entry) => {
    const screen = screens[entry.id as keyof typeof screens];
    return screen ? {...entry, screen} : entry;
  });
};

/** `overflow { supportUs() }`: the support page from the app bar's overflow menu. */
export const supportUs = ({screen}: {screen?: string} = {}): PreviewEntry => ({
  id: 'support',
  label: 'Support the app',
  icon: 'volunteer_activism',
  ...(screen ? {screen} : {}),
});
