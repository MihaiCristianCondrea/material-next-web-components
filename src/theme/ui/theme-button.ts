/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {AnchoredPanelController} from '../../internal/anchored-panel.js';
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

  private readonly panel = new AnchoredPanelController(this, {
    isOpen: () => this.open,
    setOpen: (open) => (this.open = open),
    trigger: () => this.trigger,
    surface: () => this.surface,
    focus: () => this.controls,
  });

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
        @keydown=${this.panel.onKeyDown}
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
