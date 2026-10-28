/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html} from 'lit';
import {
  ScreenHost,
  createScreenRegistry,
  definePreviewApp,
  previewScreen,
  type MarketingScreen,
  type PreviewScreenState,
} from '../../marketing/index.js';

// One declaration for the whole app. Settings and Help are pages this preview does not draw.
const APP = definePreviewApp({
  name: 'Sample',
  tabs: [
    {id: 'today', label: 'Today', icon: 'today'},
    {id: 'tools', label: 'Tools', icon: 'grid_view'},
  ],
  drawer: {
    footer: [
      {id: 'settings', label: 'Settings', icon: 'settings'},
      {id: 'help', label: 'Help & feedback', icon: 'help_outline'},
    ],
  },
});

// Each screen renders its content and says which tab it is; the shell does the rest.
const tab = (id: 'today' | 'tools', text: string): MarketingScreen => ({
  id,
  title: id,
  description: text,
  defaults: {sheet: false},
  render: (s) => {
    const state = s as PreviewScreenState;
    return previewScreen(APP, state, {
      tab: id,
      content: html`<div style="padding: 16px; display: grid; gap: 12px">
        <p style="margin: 0">${text}</p>
        <button @click=${() => state.set?.({sheet: true})}>Open a sheet</button>
      </div>`,
      overlay: state.sheet
        ? {
            presentation: 'sheet',
            label: 'Details',
            content: html`<p style="margin: 0 0 16px">
              A sheet. Escape, the scrim or Back closes it.
            </p>`,
            onDismiss: () => state.set?.({sheet: false}),
          }
        : null,
    });
  },
});
const registry = createScreenRegistry([
  tab('today', 'The bottom bar layout: the menu opens the drawer.'),
  tab('tools', 'Beside a rail or a drawer, the app bar has no menu.'),
]);

export default (root: HTMLElement) => {
  const hosts = [...root.querySelectorAll<HTMLElement>('[data-window]')].map(
    (el) =>
      new ScreenHost(el, {
        registry,
        id: 'today',
        window: el.dataset.window,
        frame: true,
        onGo: (id, state, host) => host.load(id, state),
      })
  );
  return () => hosts.forEach((h) => h.destroy());
};
