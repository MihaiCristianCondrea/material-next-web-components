/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/focus/md-focus-ring.js';
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {DestinationMatch} from '../domain/active-destination.js';
import {styles} from './navigation-item-styles.js';

/**
 * One destination in an app shell's navigation drawer: an icon, a label and
 * an optional badge, as a link. `<mnw-app-shell>` marks the current one
 * (`active`) from its `active-path`, and asks before following it.
 *
 * @slot - The label. Overrides `label`.
 * @slot icon - A custom icon, for example an image or an SVG. Overrides `icon`.
 * @slot badge - Trailing text, for example a count.
 * @slot trailing - A custom trailing icon. Overrides `trailing-icon`.
 * @cssprop --mnw-navigation-item-height - Minimum height. Default `48px`; `56px` in a shell with `navigation-size="large"`.
 * @csspart link - The link.
 * @cssprop --mnw-navigation-item-height - Height of the item. Default `48px`.
 */
@customElement('mnw-navigation-item')
export class MaterialNextNavigationItem extends LitElement {
  static override styles = styles;

  /** Where the item goes. */
  @property()
  href = '';

  /** The label, when the default slot is empty. */
  @property()
  label = '';

  /** A Material Symbols name, when the `icon` slot is empty. */
  @property()
  icon = '';

  /**
   * A Material Symbols name shown at the end, when the `trailing` slot is
   * empty: `open_in_new` for a link that leaves the site.
   */
  @property({attribute: 'trailing-icon'})
  trailingIcon = '';

  /** `_blank` opens a new tab; the shell then lets the link go without asking. */
  @property()
  target = '';

  /** `exact` is current only on its own path; `prefix` also on paths under it. */
  @property()
  match: DestinationMatch = 'prefix';

  /** The current destination. Set by `<mnw-app-shell>`. */
  @property({type: Boolean, reflect: true})
  active = false;

  /** Focuses the link. */
  override focus(options?: FocusOptions) {
    this.renderRoot.querySelector<HTMLElement>('a')?.focus(options);
  }

  override render() {
    const blank = this.target === '_blank';
    return html`<a
      part="link"
      href=${this.href}
      target=${ifDefined(this.target || undefined)}
      rel=${ifDefined(blank ? 'noopener noreferrer' : undefined)}
      aria-current=${ifDefined(this.active ? 'page' : undefined)}
    >
      <md-ripple></md-ripple>
      <md-focus-ring></md-focus-ring>
      <span class="icon"
        ><slot name="icon"
          >${
            this.icon
              ? html`<md-icon aria-hidden="true">${this.icon}</md-icon>`
              : nothing
          }</slot
        ></span
      >
      <span class="label"><slot>${this.label}</slot></span>
      <span class="badge"><slot name="badge"></slot></span>
      <span class="trailing"
        ><slot name="trailing"
          >${
            this.trailingIcon
              ? html`<md-icon aria-hidden="true">${this.trailingIcon}</md-icon>`
              : nothing
          }</slot
        ></span
      >
      ${
        blank
          ? html`<span class="visually-hidden">(opens in a new tab)</span>`
          : nothing
      }
    </a>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-navigation-item': MaterialNextNavigationItem;
  }
}
