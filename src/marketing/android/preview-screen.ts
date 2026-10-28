/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, nothing, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {ScreenRenderContext, ScreenState} from '../domain/screen.js';
import type {
  PreviewApp,
  PreviewDestinationKind,
  PreviewEntry,
  PreviewNavigationState,
  PreviewTab,
} from './preview-app.js';
import type {
  PreviewAction,
  PreviewOverlay,
  PreviewTopBar,
} from './android-screen.js';
import './android-screen.js';

/** What one destination declares; the shell derives everything else. */
export interface PreviewDestination {
  /** The tab the destination belongs to. */
  tab?: string;
  kind?: PreviewDestinationKind;
  /** The app bar title; defaults to the tab's label. */
  title?: string;
  topBar?: PreviewTopBar;
  /** The tab's search field (`topBar: 'search'` when set). */
  search?: {
    placeholder: string;
    value?: string;
    onInput?: (value: string) => void;
  };
  actions?: PreviewAction[];
  onAction?: (id: string) => void;
  /** Back from a child destination. */
  onBack?: () => void;
  content: unknown;
  fab?: unknown;
  /** Replaces the app bar. */
  top?: unknown;
  /** What is open over the destination, if anything. */
  overlay?:
    (PreviewOverlay & {content: unknown; onDismiss?: () => void}) | null;
  /** The app bar starts in its scrolled colour. */
  scrolled?: boolean;
}

/** The screen state the shell reads: the screen's own keys plus its navigation state. */
export type PreviewScreenState = ScreenState &
  ScreenRenderContext &
  PreviewNavigationState;

const NAVIGATION_KEYS = [
  'drawerOpen',
  'railExpanded',
  'railOpen',
  'overflowOpen',
] as const;

/**
 * Renders a marketing screen's destination inside the app's shell. The navigation state (drawer,
 * rail, menu) lives in the screen's state under `drawerOpen`, `railExpanded`, `railOpen` and
 * `overflowOpen`, so presets and URLs can open it. Without `set()` (videos) the shell is static.
 *
 *   render(s) {
 *     return previewScreen(APP, s, {tab: 'numbers', content: html`...`});
 *   }
 */
export const previewScreen = (
  app: PreviewApp,
  state: PreviewScreenState,
  d: PreviewDestination
): TemplateResult => {
  const navigation: PreviewNavigationState = {};
  for (const key of NAVIGATION_KEYS) navigation[key] = Boolean(state[key]);
  const open = (target: PreviewTab | PreviewEntry) =>
    state.go?.(
      ('screen' in target && target.screen) || target.id,
      target.screenState ?? {}
    );
  const topBar = d.topBar ?? (d.search ? 'search' : 'small');
  return html`<mnw-android-screen
    .app=${app}
    .window=${state.window}
    nav-type=${state.navType ?? 'gesture'}
    tab=${ifDefined(d.tab)}
    kind=${d.kind ?? 'root'}
    heading=${ifDefined(d.title)}
    top-bar=${topBar}
    search-placeholder=${d.search?.placeholder ?? 'Search'}
    search-value=${d.search?.value ?? ''}
    .actions=${d.actions ?? []}
    .navigation=${navigation}
    .overlay=${d.overlay ? {presentation: d.overlay.presentation, label: d.overlay.label} : null}
    ?scrolled=${Boolean(d.scrolled)}
    ?interactive=${Boolean(state.set)}
    @preview-navigation=${(e: CustomEvent<{patch: PreviewNavigationState}>) => state.set?.({...e.detail.patch})}
    @preview-tab=${(e: CustomEvent<{tab: PreviewTab}>) => open(e.detail.tab)}
    @preview-entry=${(e: CustomEvent<{entry: PreviewEntry}>) => e.detail.entry.screen && open(e.detail.entry)}
    @preview-search=${(e: CustomEvent<{value: string}>) => d.search?.onInput?.(e.detail.value)}
    @preview-action=${(e: CustomEvent<{id: string}>) => d.onAction?.(e.detail.id)}
    @preview-back=${() => d.onBack?.()}
    @preview-dismiss=${() => d.overlay?.onDismiss?.()}
  >
    ${d.content} ${d.fab ? html`<div slot="fab">${d.fab}</div>` : nothing}
    ${d.top ? html`<div slot="top">${d.top}</div>` : nothing}
    ${d.overlay ? html`<div slot="overlay">${d.overlay.content}</div>` : nothing}
  </mnw-android-screen>`;
};
