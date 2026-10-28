/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/switch/switch.js';
import {html, nothing, svg, type TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {IDENTITY} from './product.js';
import {
  shellLayout,
  type MarketingScreen,
  type ScreenRenderContext,
} from '../../marketing/index.js';

/**
 * Pocket Notes' screens, the way an app keeps them in marketing/ui/src/screens:
 * each one renders only from its state, so the gallery, the prototype page,
 * captures and videos all draw the same thing. The markup and pocket-notes.css
 * belong to the app; the library hosts them.
 */

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
}

export const NOTES: Note[] = [
  {
    id: 'trip',
    title: 'Lisbon weekend',
    body: 'Tram 28 early, before the queues. Pastéis in Belém, then the river walk to the MAAT.',
    pinned: true,
  },
  {
    id: 'groceries',
    title: 'Groceries',
    body: 'Oat milk, lemons, basil, two kinds of bread, coffee beans (the light roast).',
    pinned: false,
  },
  {
    id: 'talk',
    title: 'Talk outline',
    body: 'Why screens as state: one source for the gallery, the store images and the trailer.',
    pinned: true,
  },
  {
    id: 'books',
    title: 'Books to read',
    body: 'The Design of Everyday Things, Thinking in Systems, A Pattern Language.',
    pinned: false,
  },
];

type Ctx = ScreenRenderContext;

const statusBar = () =>
  html`<div class="pn-status">
    <span>12:00</span>
    <span class="pn-status__icons" aria-hidden="true"
      ><md-icon>signal_wifi_4_bar</md-icon
      ><md-icon>signal_cellular_4_bar</md-icon
      ><md-icon>battery_full</md-icon></span
    >
  </div>`;

const systemNav = (ctx: Ctx, onBar = true) =>
  ctx.navType === 'buttons'
    ? html`<div class="pn-buttons" aria-hidden="true">
        <md-icon>arrow_back_ios_new</md-icon><md-icon>circle</md-icon
        ><md-icon>crop_square</md-icon>
      </div>`
    : html`<div
        class="pn-gesture ${onBar ? '' : 'pn-gesture--plain'}"
        aria-hidden="true"
      >
        <span></span>
      </div>`;

// The tabs come from the app's identity, like its name and icon in the hub.
const TABS = IDENTITY.app.config.tabs;

const navItems = (ctx: Ctx, current: string) =>
  TABS.map(
    (tab) =>
      html`<button
        class="pn-nav__item"
        aria-current=${ifDefined(current === tab.id ? 'page' : undefined)}
        @click=${() => ctx.go?.(tab.id)}
      >
        <span class="pn-nav__pill"><md-icon>${tab.icon}</md-icon></span
        >${tab.label}
      </button>`
  );

/**
 * The frame every top-level screen shares: a bottom bar on phones, a rail from
 * 600 dp, as App Toolkit's shell does (shellLayout() gives the rule).
 */
const frame = (
  ctx: Ctx,
  current: string,
  body: TemplateResult,
  fab?: TemplateResult
) => {
  const layout = shellLayout(ctx.window);
  const size = ctx.window
    ? `width:${layout.width}px;height:${layout.height}px`
    : '';
  if (layout.framed) {
    return html`<div class="pn-screen" style=${size}>
      ${layout.statusBar ? statusBar() : nothing}
      <div class="pn-frame">
        <nav class="pn-rail" aria-label="Sections">
          ${navItems(ctx, current)}
        </nav>
        <div class="pn-frame__body">
          ${body} ${fab ? html`<div class="pn-fab">${fab}</div>` : nothing}
        </div>
      </div>
      ${layout.systemNav ? systemNav(ctx) : nothing}
    </div>`;
  }
  return html`<div class="pn-screen" style=${size}>
    ${statusBar()}
    <div class="pn-frame__body">
      ${body} ${fab ? html`<div class="pn-fab">${fab}</div>` : nothing}
    </div>
    <nav class="pn-nav" aria-label="Sections">${navItems(ctx, current)}</nav>
    ${systemNav(ctx)}
  </div>`;
};

// example
interface NotesState extends Record<string, unknown> {
  filter: 'all' | 'pinned';
}

export const notesScreen: MarketingScreen<NotesState> = {
  id: 'notes',
  title: 'Notes',
  description:
    'The home screen: every note, with a Pinned filter and a button for a new note.',
  category: 'notes',
  categoryLabel: 'Notes',
  palette: 'ocean',
  defaults: {filter: 'all'},
  controls: [
    {
      type: 'choice',
      key: 'filter',
      label: 'Filter',
      options: ['all', 'pinned'],
    },
    {
      type: 'presets',
      label: 'Presets',
      options: [
        ['Everything', {filter: 'all'}],
        ['Pinned only', {filter: 'pinned'}],
      ],
    },
  ],
  render: (s) => {
    const notes = NOTES.filter((n) => s.filter === 'all' || n.pinned);
    const columns = shellLayout(s.window).width >= 600 ? 2 : 1;
    return frame(
      s,
      'notes',
      html`<div class="pn-bar">
          <span class="pn-bar__title">Notes</span
          ><md-icon-button aria-label="Search"
            ><md-icon>search</md-icon></md-icon-button
          >
        </div>
        <div class="pn-content">
          <md-chip-set class="pn-chips">
            ${(['all', 'pinned'] as const).map(
              (f) =>
                html`<md-filter-chip
                  label=${f === 'all' ? 'All' : 'Pinned'}
                  .selected=${s.filter === f}
                  @click=${(e: Event) => {
                    // The screen's state decides what is selected, not the chip.
                    (
                      e.currentTarget as HTMLElement & {selected: boolean}
                    ).selected = s.filter === f;
                    s.set?.({filter: f});
                  }}
                ></md-filter-chip>`
            )}
          </md-chip-set>
          <div class="pn-grid" style="--pn-columns:${columns}">
            ${notes.map(
              (n) =>
                html`<button
                  class="pn-note ${n.pinned ? 'pn-note--pinned' : ''}"
                  @click=${() => s.go?.('editor', {noteId: n.id})}
                >
                  <p class="pn-note__title">
                    ${n.title}${n.pinned ? html`<md-icon aria-label="Pinned">push_pin</md-icon>` : nothing}
                  </p>
                  <p class="pn-note__body">${n.body}</p>
                </button>`
            )}
          </div>
        </div>`,
      html`<md-fab
        variant="primary"
        aria-label="New note"
        @click=${() => s.go?.('editor', {noteId: ''})}
      >
        <md-icon slot="icon">edit</md-icon>
      </md-fab>`
    );
  },
};
// /example

interface EditorState extends Record<string, unknown> {
  noteId: string;
}

export const editorScreen: MarketingScreen<EditorState> = {
  id: 'editor',
  title: 'Note',
  description:
    'One note, opened from the list. An empty note id is a new note.',
  category: 'notes',
  categoryLabel: 'Notes',
  palette: 'ocean',
  defaults: {noteId: 'trip'},
  controls: [
    {
      type: 'choice',
      key: 'noteId',
      label: 'Note',
      options: ['trip', 'groceries', 'talk', 'books', ''],
    },
  ],
  render: (s) => {
    const note = NOTES.find((n) => n.id === s.noteId);
    const layout = shellLayout(s.window);
    const size = s.window
      ? `width:${layout.width}px;height:${layout.height}px`
      : '';
    return html`<div class="pn-screen" style=${size}>
      ${layout.statusBar ? statusBar() : nothing}
      <div class="pn-bar pn-bar--back">
        <md-icon-button aria-label="Back" @click=${() => s.go?.('notes')}
          ><md-icon>arrow_back</md-icon></md-icon-button
        >
        <span class="pn-bar__title"></span>
        <md-icon-button aria-label=${note?.pinned ? 'Unpin' : 'Pin'}
          ><md-icon
            >${note?.pinned ? 'keep_off' : 'keep'}</md-icon
          ></md-icon-button
        >
      </div>
      <div class="pn-content pn-editor">
        <h2>${note?.title ?? 'New note'}</h2>
        <p>${note?.body ?? html`<span class="pn-meta">Start typing…</span>`}</p>
        <p class="pn-meta">
          ${note ? 'Edited today at 09:41' : 'Not saved yet'}
        </p>
      </div>
      ${layout.systemNav ? systemNav(s, false) : nothing}
    </div>`;
  },
};

interface FocusState extends Record<string, unknown> {
  minutes: number;
  elapsed: number;
  running: boolean;
}

const ring = (progress: number) => {
  const r = 104;
  const c = 2 * Math.PI * r;
  return svg`<svg class="pn-ring" viewBox="0 0 240 240" aria-hidden="true">
    <circle class="pn-ring__track" cx="120" cy="120" r=${r}></circle>
    <circle class="pn-ring__value" cx="120" cy="120" r=${r}
      stroke-dasharray=${c} stroke-dashoffset=${c * (1 - progress)}></circle>
  </svg>`;
};

/**
 * A timer: `elapsed` (seconds) is plain state, so a video sets it per frame and
 * gets the same picture every time. In the browser, tick() advances it while
 * `running` is on.
 */
export const focusScreen: MarketingScreen<FocusState> = {
  id: 'focus',
  title: 'Focus timer',
  description:
    'A countdown with a progress ring. Start it in the preview; the ring follows the clock.',
  category: 'focus',
  categoryLabel: 'Focus',
  palette: 'clay',
  defaults: {minutes: 25, elapsed: 312, running: false},
  controls: [
    {key: 'minutes', label: 'Length', min: 5, max: 60, step: 5, unit: ' min'},
    {key: 'elapsed', label: 'Elapsed', min: 0, max: 3600, step: 1, unit: ' s'},
    {type: 'toggle', key: 'running', label: 'Running'},
  ],
  tick: (s, dt) =>
    s.running ? {elapsed: Math.min(s.minutes * 60, s.elapsed + dt)} : undefined,
  render: (s) => {
    const total = s.minutes * 60;
    const left = Math.max(0, total - Math.floor(s.elapsed));
    const time = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    return frame(
      s,
      'focus',
      html`<div class="pn-bar"><span class="pn-bar__title">Focus</span></div>
        <div class="pn-content pn-focus">
          ${ring(total ? Math.min(1, s.elapsed / total) : 0)}
          <span class="pn-time" role="timer">${time}</span>
          <md-fab
            variant="primary"
            size="large"
            aria-label=${s.running ? 'Pause' : 'Start'}
            @click=${() => s.set?.({running: !s.running})}
          >
            <md-icon slot="icon">${s.running ? 'pause' : 'play_arrow'}</md-icon>
          </md-fab>
        </div>`
    );
  },
};

export const SCREENS: MarketingScreen[] = [
  notesScreen as MarketingScreen,
  editorScreen as MarketingScreen,
  focusScreen as MarketingScreen,
];
