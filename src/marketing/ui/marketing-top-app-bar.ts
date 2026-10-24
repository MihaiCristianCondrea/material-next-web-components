/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './marketing-top-app-bar-styles.js';

/**
 * The hub's top app bar: the app icon and name, an optional context label
 * ("UI kit"), and trailing actions. It reflects `scrolled` while the page is
 * scrolled, which gives it the raised container tone.
 *
 * @slot trailing - Actions, for example a GitHub badge.
 */
@customElement('mnw-marketing-top-app-bar')
export class MaterialNextMarketingTopAppBar extends LitElement {
  static override styles = styles;

  /** The app's name, linked to `href`. */
  @property()
  name = '';

  /** URL of the app's icon, 32px; omitted when empty. */
  @property()
  icon = '';

  /** Where the brand links to. */
  @property()
  href = './';

  /** Muted label beside the name. */
  @property()
  context = '';

  /** Raised tone; set by the element while the window is scrolled. */
  @property({type: Boolean, reflect: true})
  scrolled = false;

  private readonly onScroll = () => {
    const scrolled = window.scrollY > 4;
    if (scrolled !== this.scrolled) this.scrolled = scrolled;
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this.onScroll, {passive: true});
    this.onScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
    super.disconnectedCallback();
  }

  override render() {
    return html`<header class="bar">
      <a class="brand" href=${this.href}>
        ${this.icon ? html`<img src=${this.icon} alt="" />` : nothing}
        <span class="name">${this.name}</span>
      </a>
      ${this.context ? html`<span class="context">${this.context}</span>` : nothing}
      <div class="trailing"><slot name="trailing"></slot></div>
    </header>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-marketing-top-app-bar': MaterialNextMarketingTopAppBar;
  }
}
