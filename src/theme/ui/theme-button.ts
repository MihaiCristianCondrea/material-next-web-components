/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, type PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {DEFAULT_SOURCE_COLOR} from '../domain/color-theme.js';
import type {ThemePreferenceStore} from '../data/theme-preference-store.js';
import {DEFAULT_THEME_STORAGE_KEY} from '../data/theme-preference-store.js';
import './theme-controls.js';
import type {MaterialNextThemeControls} from './theme-controls.js';
import {styles} from './theme-button-styles.js';

/**
 * A palette button for a top app bar. It opens `<mnw-theme-controls>` in a
 * panel under it, themes the document and remembers the choice, so a page
 * needs only this element.
 *
 * @fires color-theme-change - From the controls: `{sourceColor?, mode}`.
 */
@customElement('mnw-theme-button')
export class MaterialNextThemeButton extends LitElement {
  static override styles = styles;

  /** Whether the panel is open. */
  @property({type: Boolean, reflect: true}) open = false;

  @property() label = 'Theme';

  /** localStorage key; every page on the origin with the same key shares the theme. */
  @property({attribute: 'storage-key'}) storageKey = DEFAULT_THEME_STORAGE_KEY;

  /** A store of your own, instead of `storage-key`. */
  @property({attribute: false}) store?: ThemePreferenceStore;

  /** The page's own seed, shown until a color is chosen. */
  @property({attribute: 'default-color'}) defaultColor = DEFAULT_SOURCE_COLOR;

  @query('.trigger') private trigger?: HTMLElement;
  @query('.popover') private surface?: HTMLElement;

  /** The controls inside the panel. */
  get controls() {
    return this.renderRoot?.querySelector<MaterialNextThemeControls>(
      'mnw-theme-controls'
    );
  }

  show() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  private restoreFocus = false;

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('open') && !this.open) {
      const active = (this.renderRoot as ShadowRoot).activeElement;
      this.restoreFocus = !!active && !!this.surface?.contains(active);
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open') || (!this.open && !changed.get('open'))) return;
    const popover = this.surface;
    if (!popover) return;
    const native = typeof popover.showPopover === 'function';
    if (this.open) {
      // The top layer escapes the transforms and filters of a sticky app bar.
      if (native && !popover.matches(':popover-open')) popover.showPopover();
      this.place();
      this.listen();
      this.controls?.focus();
    } else {
      if (native && popover.matches(':popover-open')) popover.hidePopover();
      this.stopListening();
      if (this.restoreFocus) this.trigger?.focus();
    }
  }

  override disconnectedCallback() {
    this.stopListening();
    super.disconnectedCallback();
  }

  /** Under the button, aligned to its end; inside the window. */
  private readonly place = () => {
    const rect = this.trigger?.getBoundingClientRect();
    if (!rect || !this.surface) return;
    // Aligned to the button's end, moved in when that would cross the start.
    const width = this.surface.offsetWidth;
    const end = Math.max(
      8,
      Math.min(window.innerWidth - rect.right, window.innerWidth - width - 8)
    );
    this.surface.style.setProperty(
      '--_top',
      `${Math.round(rect.bottom + 8)}px`
    );
    this.surface.style.setProperty('--_end', `${Math.round(end)}px`);
  };

  private readonly onDocumentPointerDown = (e: PointerEvent) => {
    if (!e.composedPath().includes(this)) this.open = false;
  };

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      e.stopPropagation();
      this.restoreFocus = true;
      this.open = false;
    }
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

  override render() {
    return html`<md-icon-button
        class="trigger"
        part="trigger"
        aria-label=${this.label}
        title=${this.label}
        aria-haspopup="dialog"
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${() => this.toggle()}
        ><md-icon>palette</md-icon></md-icon-button
      >
      <div
        class="popover"
        .popover=${'manual'}
        ?data-open=${this.open}
        @keydown=${this.onKeyDown}
      >
        <section
          class="panel"
          part="panel"
          role="dialog"
          aria-label=${this.label}
          .inert=${!this.open}
        >
          <mnw-theme-controls
            tabindex="-1"
            apply
            heading=${this.label}
            storage-key=${this.store ? '' : this.storageKey}
            .store=${this.store}
            default-color=${this.defaultColor}
          ></mnw-theme-controls>
        </section>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-theme-button': MaterialNextThemeButton;
  }
}
