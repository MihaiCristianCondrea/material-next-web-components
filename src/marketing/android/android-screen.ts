/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/textfield/filled-text-field.js';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {keyed} from 'lit/directives/keyed.js';
import type {WindowSpec} from '../domain/windows.js';
import {
  iconOf,
  logoOf,
  previewChrome,
  type PreviewApp,
  type PreviewChrome,
  type PreviewDestinationKind,
  type PreviewEntry,
  type PreviewIconInput,
  type PreviewNavigationState,
  type PreviewTab,
} from './preview-app.js';
import {styles} from './android-screen-styles.js';

/** A trailing app bar action. `selected` makes it a toggle drawn filled while on. */
export interface PreviewAction {
  id: string;
  icon: string;
  label: string;
  selected?: boolean;
}

/** The app bar a destination asks for. `search` draws the tab's search field; `none` hides the bar. */
export type PreviewTopBar = 'small' | 'center' | 'large' | 'search' | 'none';

/** Something the shell draws over the destination, with its content in the `overlay` slot. */
export interface PreviewOverlay {
  /**
   * `sheet` is a ModalBottomSheet; `dialog` an AlertDialog centred over a scrim; `fullscreen` a full-screen dialog
   * over the status bar.
   */
  presentation: 'sheet' | 'dialog' | 'fullscreen';
  /** The dialog's accessible name. */
  label: string;
  /** A sheet's drag handle (BottomSheetDefaults.DragHandle). */
  handle?: boolean;
  /** No padding around the content, which lays itself out (a sheet still keeps clear of the system navigation). */
  flush?: boolean;
}

const icon = (input: PreviewIconInput, {filled = false} = {}) => {
  const {name, rounded} = iconOf(input);
  return html`<md-icon
    class="${rounded ? 'rounded' : ''} ${filled ? 'filled' : ''}"
    >${name}</md-icon
  >`;
};

/** The deepest focused element, through shadow roots. */
const deepActive = () => {
  let el = document.activeElement as HTMLElement | null;
  while (el?.shadowRoot?.activeElement)
    el = el.shadowRoot.activeElement as HTMLElement;
  return el;
};

/**
 * An app screen inside the App Toolkit shell, drawn as Compose draws it: status bar, app bar,
 * the navigation the window's layout calls for (bar, rail, expanded rail or permanent drawer), the
 * system navigation, and the modal drawer, modal rail, overflow menu and sheets over it.
 *
 * The app declares itself once with `definePreviewApp()`; each destination sets its tab, title,
 * app bar and overlay. Which buttons appear comes from `previewChrome()`, never from the screen.
 * Content stays in light DOM, so the app's own CSS applies to it.
 *
 * Without `interactive` (videos and captures) nothing reacts and nothing animates in: the shell
 * renders the state it is given. Interactive, it never changes its own state; it asks the host:
 *
 * @fires preview-navigation - `{patch}`: a PreviewNavigationState change (drawer, rail, menu).
 * @fires preview-tab - `{tab}`: a tab was chosen.
 * @fires preview-entry - `{entry}`: a drawer, rail or overflow entry was chosen.
 * @fires preview-back - The app bar's or the system's Back.
 * @fires preview-search - `{value}`: the tab's search text changed.
 * @fires preview-action - `{id}`: an app bar action was pressed.
 * @fires preview-dismiss - The overlay was dismissed: scrim, Escape or Back.
 *
 * @slot - The destination's content.
 * @slot fab - A floating action button, placed above the navigation bar and the system bars.
 * @slot bottom - The destination's own bottom bar (Scaffold's `bottomBar`): an action row or a message field,
 *   between the content and the navigation bar.
 * @slot top - Replaces the app bar, for a destination with its own (an article's).
 * @slot overlay - The overlay's content (see `overlay`).
 */
@customElement('mnw-android-screen')
export class MaterialNextAndroidScreen extends LitElement {
  static override styles = styles;

  @property({attribute: false}) app?: PreviewApp;

  /** A window name (`phone`, `fold`, `desktop`) or size. */
  @property({attribute: false}) window?: string | WindowSpec;

  @property({attribute: 'nav-type'}) navType: 'gesture' | 'buttons' = 'gesture';

  /** The tab this destination belongs to, selected in the navigation. */
  @property() tab?: string;

  @property() kind: PreviewDestinationKind = 'root';

  /**
   * The app bar title, overriding the shell's: a tab's root names the app, or the tab once the
   * navigation beside it names the app; a child or page has no default.
   */
  @property() heading?: string;

  @property({attribute: 'top-bar'}) topBar: PreviewTopBar = 'small';

  @property({attribute: 'search-placeholder'}) searchPlaceholder = 'Search';

  @property({attribute: 'search-value'}) searchValue = '';

  @property({attribute: false}) actions: PreviewAction[] = [];

  @property({attribute: false}) navigation: PreviewNavigationState = {};

  @property({attribute: false}) overlay: PreviewOverlay | null = null;

  /** The app bar and status bar take the scrolled colour. */
  @property({type: Boolean}) scrolled = false;

  /**
   * How far a large app bar has collapsed, 0 to 1, for screens that scroll from their state (captures).
   * Unset, the bar follows the content's own scrolling.
   */
  @property({type: Number}) collapse?: number;

  /** Live preview: reacts to input and animates overlays in. Off in videos and captures. */
  @property({type: Boolean, reflect: true}) interactive = false;

  @query('.content') private content?: HTMLElement;

  private chrome!: PreviewChrome;
  private returnFocus: HTMLElement | null = null;
  private wasOpen = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.onKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.onKeyDown);
  }

  /** Whether anything is open over the destination. */
  get covered() {
    const c = this.chrome;
    return Boolean(
      c && (c.drawerOpen || c.railOpen || c.overflowOpen || this.overlay)
    );
  }

  private emit(type: string, detail?: unknown) {
    if (!this.interactive) return;
    this.dispatchEvent(
      new CustomEvent(type, {detail, bubbles: true, composed: true})
    );
  }

  private navigate(patch: PreviewNavigationState) {
    this.emit('preview-navigation', {patch});
  }

  private chooseTab(tab: PreviewTab) {
    this.navigate({drawerOpen: false, railOpen: false, overflowOpen: false});
    this.emit('preview-tab', {tab});
  }

  private chooseEntry(entry: PreviewEntry) {
    this.navigate({drawerOpen: false, railOpen: false, overflowOpen: false});
    this.emit('preview-entry', {entry});
  }

  /** Escape closes the topmost layer: the menu, then the navigation, then the overlay. */
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !this.interactive || !this.dismissTop()) return;
    e.preventDefault();
    e.stopPropagation();
  };

  /** Closes the topmost layer, as Back does. Returns whether anything closed. */
  dismissTop() {
    const c = this.chrome;
    if (!c) return false;
    if (c.overflowOpen) this.navigate({overflowOpen: false});
    else if (c.drawerOpen || c.railOpen)
      this.navigate({drawerOpen: false, railOpen: false});
    else if (this.overlay) this.emit('preview-dismiss');
    else return false;
    return true;
  }

  private systemBack = () => {
    if (!this.dismissTop() && this.kind !== 'root') this.emit('preview-back');
  };

  private setCollapse(collapse: number) {
    this.style.setProperty('--_collapse', collapse.toFixed(3));
    this.style.setProperty(
      '--_title-opacity',
      collapse > 0.75 ? ((collapse - 0.75) / 0.25).toFixed(3) : '0'
    );
  }

  private onScroll = () => {
    const el = this.content;
    if (!el) return;
    const top = el.scrollTop;
    this.toggleAttribute(
      'data-scrolled',
      this.scrolled || top > 4 || (this.collapse ?? 0) > 0
    );
    if (this.collapse === undefined)
      this.setCollapse(Math.min(1, Math.max(0, top / 88)));
  };

  override willUpdate() {
    if (!this.app) return;
    const wasExpanded = this.chrome?.railExpanded;
    this.chrome = previewChrome(this.app, {
      window: this.window,
      kind: this.kind,
      navType: this.navType,
      navigation: this.navigation,
      tab: this.tab,
    });
    // Tab navigation can remount an already-expanded shell. Reveal labels only
    // when this mounted rail actually opens, not when it starts expanded.
    if (!this.chrome.railExpanded) this.removeAttribute('data-rail-opening');
    else if (this.hasUpdated && wasExpanded === false)
      this.setAttribute('data-rail-opening', '');
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    const c = this.chrome;
    if (!c) return;
    const {layout} = c;
    this.style.setProperty('--_width', `${layout.width}px`);
    this.style.setProperty('--_height', `${layout.height}px`);
    this.style.setProperty('--_status-bar', `${layout.statusBar}px`);
    this.style.setProperty('--_system-nav', `${c.systemNav}px`);
    this.style.setProperty('--_bottom-bar', `${c.bottomBar}px`);
    this.toggleAttribute('data-framed', layout.framed);
    this.toggleAttribute(
      'data-scrolled',
      this.scrolled ||
        (this.content?.scrollTop ?? 0) > 4 ||
        (this.collapse ?? 0) > 0
    );
    if (this.collapse !== undefined)
      this.setCollapse(Math.min(1, Math.max(0, this.collapse)));
    // Focus moves into what opened and back to what opened it, as Compose's dialogs do.
    const open = this.covered;
    if (this.interactive && open && !this.wasOpen) {
      this.returnFocus = deepActive();
      const surface =
        this.renderRoot.querySelector<HTMLElement>('[data-surface]');
      surface?.focus({preventScroll: true});
    } else if (!open && this.wasOpen) {
      const target = this.returnFocus;
      this.returnFocus = null;
      if (target?.isConnected) target.focus({preventScroll: true});
    }
    this.wasOpen = open;
  }

  private renderStatusBar() {
    if (!this.chrome.layout.statusBar) return nothing;
    // A blank status bar keeps captures timeless: no clock, no system icons.
    if (this.app!.config.statusBar === 'blank')
      return html`<div class="status" aria-hidden="true"></div>`;
    return html`<div class="status" aria-hidden="true">
      <span>12:00</span>
      <span class="status__icons"
        ><md-icon>signal_wifi_4_bar</md-icon
        ><md-icon>signal_cellular_4_bar</md-icon
        ><md-icon>battery_full</md-icon></span
      >
    </div>`;
  }

  private renderTopBar() {
    const c = this.chrome;
    const app = this.app!;
    if (this.topBar === 'none') return nothing;
    const nav = c.navButton
      ? html`<md-icon-button
          aria-label=${c.navButton === 'back' ? 'Navigate up' : 'Open navigation drawer'}
          @click=${() => (c.navButton === 'back' ? this.emit('preview-back') : this.navigate({drawerOpen: true}))}
          ><md-icon
            >${c.navButton === 'back' ? 'arrow_back' : 'menu'}</md-icon
          ></md-icon-button
        >`
      : nothing;
    const actions = html`<div class="actions">
      ${this.actions.map(
        (a) =>
          html`<md-icon-button
            aria-label=${a.label}
            .ariaPressed=${a.selected === undefined ? null : String(a.selected)}
            @click=${() => this.emit('preview-action', {id: a.id})}
            ><md-icon class=${a.selected ? 'filled' : ''}
              >${a.icon}</md-icon
            ></md-icon-button
          >`
      )}
      ${
        c.overflow
          ? html`<md-icon-button
              aria-label="More options"
              aria-haspopup="menu"
              .ariaExpanded=${String(c.overflowOpen)}
              @click=${() => this.navigate({overflowOpen: !c.overflowOpen})}
              ><md-icon>more_vert</md-icon></md-icon-button
            >`
          : nothing
      }
    </div>`;
    const tab = app.tab(this.tab);
    const text =
      this.heading ??
      (c.titleSource === 'tab'
        ? (tab?.label ?? app.config.name)
        : c.titleSource === 'app'
          ? app.config.name
          : '');
    // A new title fades in where the old one stood, as the app's shared title bounds do.
    const title = keyed(text, html`<span class="title__text">${text}</span>`);
    const barClass = `topbar topbar--${this.topBar} ${c.navButton ? '' : 'topbar--no-nav'}`;
    if (this.topBar === 'search') {
      return html`<div class=${barClass}>
        ${nav}
        <md-filled-text-field
          class="search"
          type="search"
          aria-label=${this.searchPlaceholder}
          placeholder=${this.searchPlaceholder}
          .value=${this.searchValue}
          @input=${(e: Event) => this.emit('preview-search', {value: (e.target as HTMLInputElement).value})}
        >
          <md-icon slot="leading-icon">search</md-icon>
          ${
            this.searchValue
              ? html`<md-icon-button
                  slot="trailing-icon"
                  aria-label="Clear search"
                  @click=${() => this.emit('preview-search', {value: ''})}
                  ><md-icon>close</md-icon></md-icon-button
                >`
              : nothing
          }
        </md-filled-text-field>
        ${actions}
      </div>`;
    }
    if (this.topBar === 'large') {
      return html`<div class=${barClass}>
        <div class="row">
          ${nav}
          <h1 class="title">${title}</h1>
          ${actions}
        </div>
        <div class="large-title" aria-hidden="true">${title}</div>
      </div>`;
    }
    return html`<div class=${barClass}>
      ${nav}
      <h1 class="title">${title}</h1>
      ${actions}
    </div>`;
  }

  private tabIcon(tab: PreviewTab, selected: boolean) {
    return selected
      ? icon(tab.selectedIcon ?? tab.icon, {filled: true})
      : icon(tab.icon);
  }

  /** ShellNavigationBar (Compose NavigationBar): 80 dp, a 56 x 32 dp pill behind the selected icon. */
  private renderNavigationBar() {
    const c = this.chrome;
    if (c.mode !== 'bottomBar' || this.kind === 'page') return nothing;
    // Under a child no tab is marked (`highlightedTab`).
    return html`<nav class="navbar" aria-label="Tabs">
      ${this.app!.config.tabs.map((t) => {
        const selected = t.id === c.selectedTab;
        return html`<button
          class="navbar__item"
          aria-current=${ifDefined(selected ? 'page' : undefined)}
          @click=${() => this.chooseTab(t)}
        >
          <span class="navbar__indicator">${this.tabIcon(t, selected)}</span>
          <span class="navbar__label">${t.label}</span>
        </button>`;
      })}
    </nav>`;
  }

  private entryItem(
    entry: PreviewEntry,
    cls: 'drawer' | 'rail',
    expanded = true
  ) {
    // Pages the preview does not draw: drawn as the app draws them, the entry only closes the navigation.
    const previewOnly = !entry.screen;
    if (cls === 'rail' && !expanded) {
      return html`<button
        class="rail__item"
        data-preview-only=${previewOnly || nothing}
        title=${ifDefined(previewOnly ? 'Not part of this preview' : undefined)}
        @click=${() => this.chooseEntry(entry)}
      >
        <span class="rail__indicator">${icon(entry.icon)}</span
        ><span class="rail__label">${entry.label}</span>
      </button>`;
    }
    return html`<button
      class="${cls === 'rail' ? 'rail__item' : 'drawer__item'}"
      data-preview-only=${previewOnly || nothing}
      title=${ifDefined(previewOnly ? 'Not part of this preview' : undefined)}
      @click=${() => this.chooseEntry(entry)}
    >
      ${cls === 'rail' ? html`<span class="rail__indicator">${icon(entry.icon)}</span><span class="rail__label">${entry.label}</span>` : html`${icon(entry.icon)}<span>${entry.label}</span>${entry.badge !== undefined ? html`<span class="badge">${entry.badge}</span>` : nothing}`}
    </button>`;
  }

  private renderRail({
    expanded,
    modal = false,
  }: {
    expanded: boolean;
    modal?: boolean;
  }) {
    const c = this.chrome;
    const {tabs, drawer = {}} = this.app!.config;
    const button = modal ? 'collapse' : c.railButton;
    const toggle = () => {
      if (modal) this.navigate({railOpen: false});
      else if (c.mode === 'rail') this.navigate({railOpen: true});
      else this.navigate({railExpanded: !c.railExpanded});
    };
    return html`<nav
      class="rail ${expanded ? 'rail--expanded' : ''}"
      aria-label="Navigation"
    >
      <div class="rail__header">
        ${
          button
            ? html`<md-icon-button
                aria-label=${button === 'collapse' ? 'Collapse navigation' : 'Expand navigation'}
                .ariaExpanded=${String(button === 'collapse')}
                @click=${toggle}
                ><md-icon
                  >${button === 'collapse' ? 'menu_open' : 'menu'}</md-icon
                ></md-icon-button
              >`
            : nothing
        }
        ${expanded ? html`<span class="rail__title">${this.app!.config.name}</span>` : nothing}
      </div>
      <div class="rail__items">
        ${tabs.map(
          (t) =>
            html`<button
              class="rail__item"
              aria-current=${ifDefined(t.id === this.chrome.selectedTab ? 'page' : undefined)}
              @click=${() => this.chooseTab(t)}
            >
              <span class="rail__indicator"
                >${this.tabIcon(t, t.id === this.chrome.selectedTab)}</span
              >
              <span class="rail__label"
                >${expanded ? t.label : (t.shortLabel ?? t.label)}</span
              >
            </button>`
        )}
        ${drawer.entries?.length ? html`<span class="rail__divider"></span>` : nothing}
        ${(drawer.entries ?? []).map((e) => this.entryItem(e, 'rail', expanded))}
      </div>
      <div class="rail__items rail__footer">
        ${(drawer.footer ?? []).map((e) => this.entryItem(e, 'rail', expanded))}
      </div>
    </nav>`;
  }

  /** ShellDrawerContent: the header, the tabs when nothing else shows them, the entries, the footer. */
  private renderDrawerContent(showTabs: boolean) {
    const {name, tabs, drawer = {}} = this.app!.config;
    const logo = logoOf(this.app!);
    return html`
      <div class="drawer__header">
        ${logo ? html`<img src=${logo} alt="" />` : nothing}<span>${name}</span>
      </div>
      <div class="drawer__items">
        ${
          showTabs
            ? tabs.map(
                (t) =>
                  html`<button
                    class="drawer__item"
                    aria-current=${ifDefined(t.id === this.chrome.selectedTab ? 'page' : undefined)}
                    @click=${() => this.chooseTab(t)}
                  >
                    ${this.tabIcon(t, t.id === this.chrome.selectedTab)}<span
                      >${t.label}</span
                    >
                    ${t.badge !== undefined ? html`<span class="badge">${t.badge}</span>` : nothing}
                  </button>`
              )
            : nothing
        }
        ${showTabs && drawer.entries?.length ? html`<span class="drawer__divider"></span>` : nothing}
        ${(drawer.entries ?? []).map((e) => this.entryItem(e, 'drawer'))}
      </div>
      <div class="drawer__items drawer__footer">
        ${(drawer.footer ?? []).map((e) => this.entryItem(e, 'drawer'))}
      </div>
    `;
  }

  private renderSystemNav() {
    const c = this.chrome;
    if (!c.systemNav) return nothing;
    const underBar = c.bottomBar > 0 ? 'sysnav--under-bar' : '';
    if (this.navType === 'buttons') {
      return html`<div class="sysnav sysnav--buttons ${underBar}">
        <button
          class="sysnav__button"
          aria-label="Back"
          @click=${this.systemBack}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17 4.5v15a1 1 0 0 1-1.5.86l-11.25-7.5a1 1 0 0 1 0-1.72L15.5 3.64A1 1 0 0 1 17 4.5z"
            />
          </svg>
        </button>
        <button class="sysnav__button" aria-label="Home" tabindex="-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
        <button class="sysnav__button" aria-label="Recents" tabindex="-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="5" width="14" height="14" rx="2.5" />
          </svg>
        </button>
      </div>`;
    }
    return html`<div
      class="sysnav sysnav--gesture ${underBar}"
      aria-hidden="true"
    >
      <span class="sysnav__handle"></span>
    </div>`;
  }

  private renderOverlays() {
    const c = this.chrome;
    const scrim = (close: () => void) =>
      html`<div class="scrim" @click=${close}></div>`;
    return html`
      ${
        this.overlay
          ? html`<div class="overlay overlay--${this.overlay.presentation}">
              ${this.overlay.presentation !== 'fullscreen' ? scrim(() => this.emit('preview-dismiss')) : nothing}
              <div
                class="${this.overlay.presentation} ${this.overlay.flush ? 'flush' : ''}"
                role=${this.overlay.presentation === 'dialog' ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-label=${this.overlay.label}
                tabindex="-1"
                data-surface
              >
                ${this.overlay.presentation === 'sheet' && this.overlay.handle ? html`<div class="sheet__handle" aria-hidden="true"></div>` : nothing}
                <slot name="overlay"></slot>
              </div>
            </div>`
          : nothing
      }
      ${
        c.drawerOpen
          ? html`<div class="overlay">
              ${scrim(() => this.navigate({drawerOpen: false}))}
              <aside
                class="modal-drawer drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                tabindex="-1"
                data-surface
              >
                ${this.renderDrawerContent(false)}
              </aside>
            </div>`
          : nothing
      }
      ${
        c.railOpen
          ? html`<div class="overlay">
              ${scrim(() => this.navigate({railOpen: false}))}
              <div
                class="modal-rail"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                tabindex="-1"
                data-surface
              >
                ${this.renderRail({expanded: true, modal: true})}
              </div>
            </div>`
          : nothing
      }
      ${
        c.overflowOpen
          ? html`<div
              class="menu-layer"
              @click=${() => this.navigate({overflowOpen: false})}
            >
              <div
                class="menu"
                role="menu"
                tabindex="-1"
                data-surface
                @click=${(e: Event) => e.stopPropagation()}
              >
                ${(this.app!.config.overflow ?? []).map(
                  (e) =>
                    html`<button
                      class="menu__item"
                      role="menuitem"
                      data-preview-only=${!e.screen || nothing}
                      title=${ifDefined(!e.screen ? 'Not part of this preview' : undefined)}
                      @click=${() => this.chooseEntry(e)}
                    >
                      ${icon(e.icon)}<span>${e.label}</span>
                    </button>`
                )}
              </div>
            </div>`
          : nothing
      }
    `;
  }

  override render() {
    if (!this.app || !this.chrome) return nothing;
    const c = this.chrome;
    const covered = this.covered;
    const top = html`<slot name="top">${this.renderTopBar()}</slot>`;
    const content = html`<div class="content" @scroll=${this.onScroll}>
        <slot></slot>
      </div>
      <div class="bottom">
        <slot
          name="bottom"
          @slotchange=${(e: Event) =>
            this.toggleAttribute(
              'data-bottom',
              (e.target as HTMLSlotElement).assignedElements().length > 0
            )}
        ></slot>
      </div>
      <div class="fab"><slot name="fab"></slot></div>`;
    if (c.layout.framed) {
      const nav =
        c.mode === 'permanentDrawer'
          ? html`<nav class="drawer drawer--permanent" aria-label="Navigation">
              ${this.renderDrawerContent(true)}
            </nav>`
          : this.renderRail({expanded: c.railExpanded});
      return html`
        <div class="body" .inert=${covered}>
          ${this.renderStatusBar()}
          <div class="frame">
            ${nav}
            <div class="frame__body">
              ${top}
              <div class="frame__card">${content}</div>
            </div>
          </div>
        </div>
        ${this.renderSystemNav()} ${this.renderOverlays()}
      `;
    }
    return html`
      <div class="body" .inert=${covered}>
        ${this.renderStatusBar()} ${top} ${content}
        ${this.renderNavigationBar()}
      </div>
      ${this.renderSystemNav()} ${this.renderOverlays()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-android-screen': MaterialNextAndroidScreen;
  }
}
