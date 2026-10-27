/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/text-button.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {repeat} from 'lit/directives/repeat.js';
import {prefersReducedMotion} from '../../internal/environment.js';
import {marketingAsset} from '../../marketing/ui/assets.js';
import {
  migrateLegacyLauncherId,
  PROJECT_LAUNCHER_CATALOG,
} from '../catalog/projects.js';
import {
  createLauncherPreferenceStore,
  DEFAULT_LAUNCHER_STORAGE_KEY,
  type LauncherPreferenceStore,
} from '../data/launcher-preference-store.js';
import {type LauncherCatalog} from '../domain/launcher-catalog.js';
import {
  addFavorite,
  moveFavorite,
  removeFavorite,
  resolveLauncher,
  type LauncherView,
} from '../domain/launcher-favorites.js';
import type {
  LauncherItem,
  LauncherItemId,
  LauncherItemKind,
} from '../domain/launcher-item.js';
import {styles} from './product-launcher-styles.js';

export type LauncherChangeEvent = CustomEvent<{favoriteIds: LauncherItemId[]}>;
export type LauncherToggleEvent = CustomEvent<{open: boolean}>;

const KIND_ICONS: Record<LauncherItemKind, string> = {
  'android-app': 'android',
  web: 'public',
  console: 'admin_panel_settings',
  shortcut: 'link',
};

const COLUMNS = 3;
const DRAG_THRESHOLD = 6;

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

const listAttribute = {
  fromAttribute: (value: string | null) =>
    (value ?? '').split(/[\s,]+/).filter(Boolean),
  toAttribute: (value: string[]) => value.join(' '),
};

/**
 * An apps button that opens the visitor's favorite products, consoles and
 * shortcuts, with a separate list of admin redirects. Visitors edit their
 * favorites in place (add, remove, drag or Alt+arrow keys to reorder, reset),
 * and the list persists in localStorage, shared by every page on the origin.
 *
 * The current product is never offered: entries matching `current-product`,
 * `exclude` or this page's URL are hidden, and a hidden favorite keeps its
 * place for the pages where it shows. Without a `catalog` the launcher lists
 * Mihai-Cristian Condrea's projects (PROJECT_LAUNCHER_CATALOG).
 *
 * @fires launcher-change - `{favoriteIds}`: the visitor changed favorites (hidden ones included).
 * @fires launcher-toggle - `{open}`: the panel opened or closed.
 * @cssprop --mnw-launcher-width - Panel width from 600px up. Default `360px`.
 * @cssprop --mnw-launcher-monochrome-filter - Filter for `monochrome` icons. Default `none`, `invert(1)` in dark color schemes.
 * @csspart trigger - The apps button.
 * @csspart panel - The panel surface.
 */
@customElement('mnw-product-launcher')
export class MaterialNextProductLauncher extends LitElement {
  static override styles = styles;

  /** Everything the launcher can show. Defaults to PROJECT_LAUNCHER_CATALOG. */
  @property({attribute: false})
  catalog: LauncherCatalog = PROJECT_LAUNCHER_CATALOG;

  /** The product this page belongs to: an item id or a product name. */
  @property({attribute: 'current-product'})
  currentProduct = '';

  /** This page's URL, for hiding links to itself. Defaults to `location.href`. */
  @property({attribute: 'current-url'})
  currentUrl = '';

  /** More item ids or product names to hide, separated by spaces or commas. */
  @property({converter: listAttribute})
  exclude: string[] = [];

  /** The localStorage key favorites persist under. */
  @property({attribute: 'storage-key'})
  storageKey = DEFAULT_LAUNCHER_STORAGE_KEY;

  /** Replaces localStorage, for example with a store that syncs to an account. */
  @property({attribute: false})
  store?: LauncherPreferenceStore;

  /** The panel is open. */
  @property({type: Boolean, reflect: true})
  open = false;

  /** Use the host's Material color roles instead of the Google launcher palette. */
  @property({type: Boolean, attribute: 'follow-color-palette', reflect: true})
  followColorPalette = false;

  /** Accessible name of the apps button. */
  @property()
  label = 'Products and shortcuts';

  /** Title of the favorites card. */
  @property()
  heading = 'Your favorites';

  /** Optional visible heading above admin redirects; empty by default. */
  @property({attribute: 'redirects-heading'})
  redirectsHeading = '';

  @state() private ids: LauncherItemId[] = [];
  @state() private editing = false;
  @state() private dragging?: LauncherItemId;
  @state() private announcement = '';
  @state() private brokenImages = new Set<string>();

  @query('.trigger') private trigger?: HTMLElement;
  @query('.popover') private surface?: HTMLElement;

  private activeStore?: LauncherPreferenceStore;
  private unsubscribe?: () => void;
  private drag?: {
    id: LauncherItemId;
    x: number;
    y: number;
    pointerId: number;
    moved: boolean;
  };
  private positions?: Map<string, DOMRect>;
  private refocus?: string;
  private restoreFocus?: boolean;

  /** The visitor's favorites, hidden ones included. */
  get favoriteIds(): LauncherItemId[] {
    return [...this.ids];
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.onKeyDown);
    this.addEventListener('focusout', this.onFocusOut);
    // Moved in the DOM: the store was let go on disconnect. Without it now,
    // the next edit would not save, and the update it causes would reload
    // the stored list over it.
    if (this.hasUpdated && !this.activeStore) this.connectStore();
  }

  override disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.activeStore = undefined;
    this.stopListening();
    this.endDrag();
    super.disconnectedCallback();
  }

  /** Opens the store this launcher's properties name and loads from it. */
  private connectStore() {
    this.unsubscribe?.();
    this.activeStore =
      this.store ??
      createLauncherPreferenceStore({
        defaults: this.catalog.defaultFavorites,
        key: this.storageKey,
        migrate: migrateLegacyLauncherId,
      });
    this.ids = this.activeStore.load();
    this.unsubscribe = this.activeStore.subscribe((ids) => {
      this.ids = ids;
    });
  }

  /** Opens the panel and moves focus into it. */
  show() {
    this.open = true;
  }

  /** Closes the panel, leaving edit mode. */
  close() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  /** Restores the catalog's default favorites and forgets the stored list. */
  reset() {
    this.activeStore?.reset();
    // Forgotten, not saved: later default changes reach this visitor.
    this.commit(
      [...this.catalog.defaultFavorites],
      'Favorites reset',
      'edit',
      false
    );
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (
      !this.activeStore ||
      changed.has('store') ||
      changed.has('storageKey') ||
      changed.has('catalog')
    ) {
      this.connectStore();
    }
    if (changed.has('open') && !this.open) {
      // Before render makes the panel inert, which drops focus to the body.
      const active = (this.renderRoot as ShadowRoot).activeElement;
      this.restoreFocus ??= !!active && !!this.surface?.contains(active);
      this.editing = false;
      this.endDrag();
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open') && (this.open || changed.get('open'))) {
      this.syncPopover(changed.get('open') !== undefined);
    }
    this.playReorder();
    if (this.refocus) {
      const target = this.renderRoot.querySelector<HTMLElement>(
        `[data-focus="${CSS.escape(this.refocus)}"]`
      );
      this.refocus = undefined;
      target?.focus();
    }
  }

  private get view(): LauncherView {
    return resolveLauncher(this.catalog, this.ids, {
      currentProduct: this.currentProduct || undefined,
      currentUrl: this.currentUrl || globalThis.location?.href,
      exclude: this.exclude,
    });
  }

  // Open and close -----------------------------------------------------------

  private syncPopover(byUser: boolean) {
    const popover = this.surface;
    if (!popover) return;
    const native = typeof popover.showPopover === 'function';
    if (this.open) {
      // The top layer escapes the transforms and filters of a sticky app bar.
      if (native && !popover.matches(':popover-open')) popover.showPopover();
      this.place();
      this.listen();
      if (byUser) {
        const first = popover.querySelector<HTMLElement>('[data-autofocus]');
        (first ?? popover.querySelector<HTMLElement>('[data-focus]'))?.focus();
      }
    } else {
      if (native && popover.matches(':popover-open')) popover.hidePopover();
      this.stopListening();
      if (this.restoreFocus) this.trigger?.focus();
    }
    this.restoreFocus = undefined;
    this.dispatchEvent(
      new CustomEvent('launcher-toggle', {
        detail: {open: this.open},
        bubbles: true,
        composed: true,
      })
    );
  }

  private requestClose(restoreFocus: boolean) {
    if (!this.open) return;
    this.restoreFocus = restoreFocus;
    this.open = false;
  }

  /** Anchors the panel under the button; on phones CSS makes it a bottom sheet. */
  private readonly place = () => {
    const rect = this.trigger?.getBoundingClientRect();
    const panel = this.surface?.querySelector<HTMLElement>('.panel');
    if (!rect || !this.surface || !panel) return;
    const end = Math.max(8, window.innerWidth - rect.right);
    // Under the button; moved up when the panel would not fit below it.
    const height = Math.min(panel.scrollHeight, window.innerHeight - 16);
    const top = Math.max(
      8,
      Math.min(rect.bottom + 8, window.innerHeight - 8 - height)
    );
    this.surface.style.setProperty('--_top', `${Math.round(top)}px`);
    this.surface.style.setProperty('--_end', `${Math.round(end)}px`);
  };

  private readonly onDocumentPointerDown = (e: PointerEvent) => {
    if (!e.composedPath().includes(this)) this.requestClose(false);
  };

  private listen() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    window.addEventListener('resize', this.place);
    window.addEventListener('scroll', this.place, {passive: true});
  }

  private stopListening() {
    document.removeEventListener(
      'pointerdown',
      this.onDocumentPointerDown,
      true
    );
    window.removeEventListener('resize', this.place);
    window.removeEventListener('scroll', this.place);
  }

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      e.stopPropagation();
      this.requestClose(true);
    }
  };

  private readonly onFocusOut = (e: FocusEvent) => {
    // Tabbing past the panel closes it, as a disclosure would.
    const next = e.relatedTarget as Node | null;
    if (this.open && next && next !== this && !this.contains(next)) {
      this.requestClose(false);
    }
  };

  /** A tap on the scrim around the phone sheet. */
  private onPopoverClick(e: Event) {
    if (e.target === e.currentTarget) this.requestClose(true);
  }

  // Editing ------------------------------------------------------------------

  private commit(
    next: LauncherItemId[],
    message: string,
    focus?: string,
    persist = true
  ) {
    this.capturePositions();
    this.ids = next;
    if (persist) this.activeStore?.save(next);
    this.announcement = message;
    this.refocus = focus;
    this.dispatchEvent(
      new CustomEvent('launcher-change', {
        detail: {favoriteIds: [...next]},
        bubbles: true,
        composed: true,
      })
    );
  }

  private addItem(item: LauncherItem) {
    if (this.ids.includes(item.id)) return;
    const next = addFavorite(this.ids, item.id);
    if (next.length === this.ids.length) {
      this.announcement = 'Favorites are full. Remove one first.';
      return;
    }
    this.commit(next, `${item.title} added to favorites`, `fav:${item.id}`);
  }

  private removeItem(item: LauncherItem, focusAfter?: string) {
    this.commit(
      removeFavorite(this.ids, item.id),
      `${item.title} removed from favorites`,
      focusAfter
    );
  }

  private moveItem(item: LauncherItem, to: number, visible: LauncherItemId[]) {
    const next = moveFavorite(this.ids, item.id, to, visible);
    if (next.every((id, i) => id === this.ids[i])) return;
    const position = Math.max(0, Math.min(to, visible.length - 1)) + 1;
    this.commit(
      next,
      `${item.title} moved to position ${position} of ${visible.length}`,
      `fav:${item.id}`
    );
  }

  private onTileKeyDown(
    e: KeyboardEvent,
    item: LauncherItem,
    index: number,
    visible: LauncherItemId[]
  ) {
    if (!this.editing || e.target !== e.currentTarget) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const neighbour = visible[index + 1] ?? visible[index - 1];
      this.removeItem(item, neighbour ? `fav:${neighbour}` : 'edit');
      return;
    }
    if (!e.altKey) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const step: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -COLUMNS,
      ArrowDown: COLUMNS,
    };
    if (!(e.key in step)) return;
    e.preventDefault();
    this.moveItem(item, index + step[e.key], visible);
  }

  // Pointer drag, for mouse, pen and touch alike: the list reorders under the
  // pointer and saves when it is released.

  private onPointerDown(e: PointerEvent, item: LauncherItem) {
    if (!this.editing || e.button !== 0) return;
    if ((e.target as Element).closest('.remove')) return;
    this.drag = {
      id: item.id,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      moved: false,
    };
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private readonly onPointerMove = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_THRESHOLD)
        return;
      drag.moved = true;
      this.dragging = drag.id;
    }
    e.preventDefault();
    // Hit-test the grid cells, which stay put, not the tiles, which slide
    // to their new places and would bounce the drag back and forth.
    const cells = [
      ...this.renderRoot.querySelectorAll<HTMLElement>(
        '.grid--favorites > .cell'
      ),
    ];
    const to = cells.findIndex((cell) => {
      const box = cell.getBoundingClientRect();
      return (
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom
      );
    });
    const visible = this.view.favorites.map((item) => item.id);
    if (to < 0 || visible[to] === drag.id) return;
    this.capturePositions();
    this.ids = moveFavorite(this.ids, drag.id, to, visible);
  };

  private readonly onPointerUp = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    this.endDrag();
    if (!drag.moved) return;
    const view = this.view;
    const item = view.favorites.find((f) => f.id === drag.id);
    if (!item) return;
    const position = view.favorites.indexOf(item) + 1;
    this.commit(
      [...this.ids],
      `${item.title} moved to position ${position} of ${view.favorites.length}`
    );
  };

  private endDrag() {
    this.drag = undefined;
    this.dragging = undefined;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  // Tiles slide to their new places instead of jumping (FLIP).

  private capturePositions() {
    if (prefersReducedMotion()) return;
    this.positions = new Map(
      [...this.renderRoot.querySelectorAll<HTMLElement>('[data-favorite]')].map(
        (tile) => [tile.dataset.favorite!, tile.getBoundingClientRect()]
      )
    );
  }

  private playReorder() {
    const before = this.positions;
    this.positions = undefined;
    if (!before) return;
    for (const tile of this.renderRoot.querySelectorAll<HTMLElement>(
      '[data-favorite]'
    )) {
      const old = before.get(tile.dataset.favorite!);
      if (!old) continue;
      const now = tile.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (!dx && !dy) continue;
      tile.animate?.(
        [{transform: `translate(${dx}px, ${dy}px)`}, {transform: 'none'}],
        {duration: 280, easing: 'cubic-bezier(0.34, 1.36, 0.64, 1)'}
      );
    }
  }

  // Rendering ----------------------------------------------------------------

  private imageFor(item: LauncherItem) {
    if (!item.image || this.brokenImages.has(item.id)) return '';
    return item.image.startsWith('asset:')
      ? marketingAsset(item.image.slice('asset:'.length))
      : item.image;
  }

  private icon(item: LauncherItem) {
    const src = this.imageFor(item);
    return html`<span
      class="icon ${item.monochrome && src ? 'icon--monochrome' : ''}"
      aria-hidden="true"
      >${
        src
          ? html`<img
              src=${src}
              alt=""
              draggable="false"
              loading="lazy"
              decoding="async"
              @error=${() => {
                this.brokenImages = new Set(this.brokenImages).add(item.id);
              }}
            />`
          : html`<md-icon>${item.icon ?? KIND_ICONS[item.kind]}</md-icon>`
      }</span
    >`;
  }

  private target(item: LauncherItem) {
    if (item.target) return item.target;
    try {
      const page = this.currentUrl || globalThis.location?.href;
      return new URL(item.href, page).origin === new URL(page).origin
        ? '_self'
        : '_blank';
    } catch {
      return '_blank';
    }
  }

  private tileContent(item: LauncherItem) {
    const blank = this.target(item) === '_blank';
    return html`${this.icon(item)}
      <span class="title">${item.title}</span>
      <span class="visually-hidden"
        >${item.subtitle ? `, ${item.subtitle}` : ''}${
          blank ? ' (opens in a new tab)' : ''
        }</span
      >
      <md-focus-ring></md-focus-ring>`;
  }

  private link(item: LauncherItem, list: string, autofocus = false) {
    const target = this.target(item);
    return html`<a
      class="tile"
      href=${item.href}
      target=${target}
      rel=${ifDefined(target === '_blank' ? 'noopener noreferrer' : undefined)}
      title=${item.subtitle ? `${item.title} · ${item.subtitle}` : item.title}
      data-focus=${`${list}:${item.id}`}
      ?data-autofocus=${autofocus}
      >${this.tileContent(item)}</a
    >`;
  }

  private favoriteTile(
    item: LauncherItem,
    index: number,
    visible: LauncherItemId[]
  ) {
    if (!this.editing) {
      return html`<li class="cell">${this.link(item, 'fav', index === 0)}</li>`;
    }
    return html`<li class="cell">
      <div
        class="tile tile--editing ${
          this.dragging === item.id ? 'tile--dragging' : ''
        }"
        tabindex="0"
        role="group"
        aria-roledescription="favorite"
        aria-label=${`${item.title}, ${index + 1} of ${visible.length}`}
        aria-describedby="reorder-hint"
        data-favorite=${item.id}
        data-focus=${`fav:${item.id}`}
        ?data-autofocus=${index === 0}
        @keydown=${(e: KeyboardEvent) =>
          this.onTileKeyDown(e, item, index, visible)}
        @pointerdown=${(e: PointerEvent) => this.onPointerDown(e, item)}
        @dragstart=${(e: DragEvent) => e.preventDefault()}
      >
        ${this.tileContent(item)}
        <button
          class="remove"
          aria-label=${`Remove ${item.title} from favorites`}
          @click=${() => {
            const neighbour = visible[index + 1] ?? visible[index - 1];
            this.removeItem(item, neighbour ? `fav:${neighbour}` : 'edit');
          }}
        >
          <md-icon aria-hidden="true">remove</md-icon>
        </button>
      </div>
    </li>`;
  }

  /** A redirect or another entry while editing: a button that adds it. */
  private addTile(item: LauncherItem, list: string) {
    const added = this.ids.includes(item.id);
    return html`<li class="cell">
      <button
        class="tile tile--add ${added ? 'tile--added' : ''}"
        aria-label=${
          added
            ? `${item.title}, in favorites`
            : `Add ${item.title} to favorites`
        }
        aria-disabled=${added ? 'true' : 'false'}
        data-focus=${`${list}:${item.id}`}
        @click=${() => this.addItem(item)}
      >
        ${this.tileContent(item)}
        <span class="badge" aria-hidden="true"
          ><md-icon>${added ? 'check' : 'add'}</md-icon></span
        >
      </button>
    </li>`;
  }

  override render() {
    const view = this.view;
    const visible = view.favorites.map((item) => item.id);
    const hidden = view.hiddenFavoriteIds.length;
    return html`
      <md-icon-button
        class="trigger"
        part="trigger"
        aria-label=${this.label}
        title=${this.label}
        aria-haspopup="dialog"
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${() => this.toggle()}
      >
        <md-icon>apps</md-icon>
      </md-icon-button>
      <div
        class="popover"
        .popover=${'manual'}
        ?data-open=${this.open}
        @click=${this.onPopoverClick}
      >
        <section
          id="panel"
          class="panel"
          part="panel"
          role="dialog"
          aria-labelledby="heading"
          .inert=${!this.open}
        >
          <div class="card ${this.editing ? 'card--editing' : ''}">
            <header class="header">
              <div class="heading">
                <h2 id="heading">${this.heading}</h2>
              </div>
              ${
                this.editing
                  ? html`<md-text-button
                      class="reset"
                      @click=${() => this.reset()}
                      >Reset</md-text-button
                    >`
                  : nothing
              }
              <md-icon-button
                class="edit"
                toggle
                data-focus="edit"
                .selected=${this.editing}
                aria-label="Edit favorites"
                title=${this.editing ? 'Done' : 'Edit favorites'}
                @change=${(e: Event) => {
                  this.editing = (
                    e.currentTarget as HTMLElement & {selected: boolean}
                  ).selected;
                  this.announcement = this.editing
                    ? 'Editing favorites'
                    : 'Favorites saved';
                }}
              >
                <md-icon>edit</md-icon>
                <md-icon slot="selected">check</md-icon>
              </md-icon-button>
              <md-icon-button
                class="close"
                aria-label="Close"
                @click=${() => this.requestClose(true)}
              >
                <md-icon>close</md-icon>
              </md-icon-button>
            </header>
            ${
              view.favorites.length
                ? html`<ul class="grid grid--favorites" aria-label="Favorites">
                    ${repeat(
                      view.favorites,
                      (item) => item.id,
                      (item, index) => this.favoriteTile(item, index, visible)
                    )}
                  </ul>`
                : html`<p class="empty">
                    ${
                      this.editing
                        ? 'Add products from the lists below.'
                        : 'No favorites on this page yet. Choose Edit to add some.'
                    }
                  </p>`
            }
            <p id="reorder-hint" class="hint" ?hidden=${!this.editing}>
              Drag to reorder, or use Alt with the arrow keys. Delete removes.
              ${
                hidden
                  ? `${plural(hidden, 'favorite')} hidden on this page ${
                      hidden === 1 ? 'keeps its' : 'keep their'
                    } place.`
                  : ''
              }
              Saved on this device.
            </p>
          </div>
          ${
            view.redirects.length
              ? html`${
                    this.redirectsHeading
                      ? html`<h3 class="section-title">
                          ${this.redirectsHeading}
                        </h3>`
                      : nothing
                  }
                  <ul
                    class="grid grid--redirects"
                    aria-label=${this.redirectsHeading || 'Admin redirects'}
                  >
                    ${view.redirects.map((item) =>
                      this.editing
                        ? this.addTile(item, 'redirect')
                        : html`<li class="cell">
                            ${this.link(item, 'redirect')}
                          </li>`
                    )}
                  </ul>`
              : nothing
          }
          ${
            this.editing && view.available.length
              ? html`<h3 class="section-title" id="more-title">More</h3>
                  <ul class="grid" aria-labelledby="more-title">
                    ${repeat(
                      view.available,
                      (item) => item.id,
                      (item) => this.addTile(item, 'more')
                    )}
                  </ul>`
              : nothing
          }
        </section>
      </div>
      <div class="visually-hidden" role="status" aria-live="polite">
        ${this.announcement}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-product-launcher': MaterialNextProductLauncher;
  }
  interface HTMLElementEventMap {
    'launcher-change': LauncherChangeEvent;
    'launcher-toggle': LauncherToggleEvent;
  }
}
