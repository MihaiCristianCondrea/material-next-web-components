/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/filled-tonal-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {NAV_ICONS} from './options.js';
import {styles} from './screen-card-styles.js';

export type CardToggleEvent = CustomEvent<{selected: boolean}>;

/**
 * One screen in the catalog. The live screen goes in the default slot and
 * stays in light DOM, so the app's own CSS and palette reach it.
 *
 * @slot - The screen's mount element.
 * @fires card-theme-toggle - `{selected}`: dark theme on this card only.
 * @fires card-nav-toggle - `{selected}`: 3-button navigation on this card only.
 */
@customElement('mnw-screen-card')
export class MaterialNextScreenCard extends LitElement {
  static override styles = styles;

  @property()
  heading = '';

  @property()
  description = '';

  /** Short category label. */
  @property()
  tag = '';

  /** The prototype page for this screen. */
  @property()
  href = '';

  /** The preview is inside a device frame. */
  @property({type: Boolean, reflect: true})
  framed = false;

  @property({type: Boolean})
  dark = false;

  @property({type: Boolean, attribute: 'three-button'})
  threeButton = false;

  private toggle(name: string, e: Event) {
    const selected = (e.currentTarget as HTMLElement & {selected: boolean})
      .selected;
    this.dispatchEvent(
      new CustomEvent(name, {detail: {selected}, bubbles: true, composed: true})
    );
  }

  override render() {
    return html`
      <div
        class="preview"
        role="group"
        aria-label=${`${this.heading} live preview`}
      >
        <slot></slot>
      </div>
      <div class="body">
        <div class="header">
          <h3>
            ${this.href ? html`<a href=${this.href}>${this.heading}</a>` : this.heading}
          </h3>
          ${this.tag ? html`<span class="tag">${this.tag}</span>` : nothing}
        </div>
        ${this.description ? html`<p>${this.description}</p>` : nothing}
        <div class="actions">
          <div class="toggles">
            <md-icon-button
              toggle
              .selected=${this.dark}
              aria-label=${`Dark theme for ${this.heading}`}
              title="Dark theme"
              @change=${(e: Event) => this.toggle('card-theme-toggle', e)}
            >
              <md-icon>dark_mode</md-icon>
              <md-icon slot="selected" class="filled">dark_mode</md-icon>
            </md-icon-button>
            <md-icon-button
              toggle
              .selected=${this.threeButton}
              aria-label=${`3-button navigation for ${this.heading}`}
              title="3-button navigation"
              @change=${(e: Event) => this.toggle('card-nav-toggle', e)}
            >
              <md-icon>${NAV_ICONS.buttons}</md-icon>
              <md-icon slot="selected" class="filled"
                >${NAV_ICONS.buttons}</md-icon
              >
            </md-icon-button>
          </div>
          ${
            this.href
              ? html`<md-filled-tonal-button href=${this.href}>
                  <md-icon slot="icon">open_in_new</md-icon>Open
                </md-filled-tonal-button>`
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-screen-card': MaterialNextScreenCard;
  }
  interface HTMLElementEventMap {
    'card-theme-toggle': CardToggleEvent;
    'card-nav-toggle': CardToggleEvent;
  }
}
