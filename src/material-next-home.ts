/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/filled-button.js';
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * Home hero for material-next-web-components.
 *
 * @slot - Optional supporting content displayed below the hero copy.
 * @csspart action - The Material Design call-to-action button.
 */
@customElement('mnw-home')
export class MaterialNextHome extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface, #1d1b20);
      font-family: Roboto, system-ui, sans-serif;
    }

    .hero {
      display: grid;
      gap: 24px;
      padding: 40px;
      border-radius: 28px;
      background: var(--md-sys-color-surface-container-high, #ece6f0);
    }

    .eyebrow {
      margin: 0;
      color: var(--md-sys-color-primary, #6750a4);
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      max-width: 760px;
      margin: 0;
      font-size: clamp(2.5rem, 8vw, 5rem);
      line-height: 0.95;
    }

    p {
      max-width: 720px;
      margin: 0;
      font-size: 1.125rem;
      line-height: 1.6;
    }
  `;

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
