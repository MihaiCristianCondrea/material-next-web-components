/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/filled-button.js';
import './app-showcase.js';
import './code-block.js';
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './material-next-home-styles.js';

/**
 * Home hero for material-next-web-components.
 *
 * @slot - Optional supporting content displayed below the hero copy.
 * @csspart action - The Material Design call-to-action button.
 */
@customElement('mnw-home')
export class MaterialNextHome extends LitElement {
  static override styles = styles;

  /** The main headline shown in the home hero. */
  @property()
  headline = 'Material components for the next web product';

  /** The URL opened by the Material Design call-to-action button. */
  @property({attribute: 'docs-href'})
  docsHref = './install/';

  override render() {
    return html`
      <section class="hero">
        <p class="eyebrow">Material Next Web Components</p>
        <h1>${this.headline}</h1>
        <p>
          A Lit library for built-in custom elements and product views that use
          Google Material Design foundations and the latest @material/web
          components.
        </p>
        <div>
          <md-filled-button href=${this.docsHref} part="action">
            Start documenting
          </md-filled-button>
        </div>
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-home': MaterialNextHome;
  }
}
