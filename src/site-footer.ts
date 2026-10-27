/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './site-footer-styles.js';

/**
 * A rounded copyright bar with optional social links.
 * @slot - Links or Material icon buttons, each with an accessible name.
 * @csspart surface - The footer bar.
 * @cssprop --mnw-site-footer-max-width - Widest the bar gets, centered. Default `900px`.
 * @cssprop --mnw-site-footer-container-color - The bar's color. Default `--md-sys-color-surface-container`.
 */
@customElement('mnw-site-footer')
export class MaterialNextSiteFooter extends LitElement {
  static override styles = styles;
  /** Copyright holder. */
  @property() owner = 'Mihai-Cristian Condrea';
  /** First copyright year. */
  @property({type: Number, attribute: 'start-year'}) startYear = 2020;
  /** Last copyright year. Defaults to the current year. */
  @property({type: Number, attribute: 'end-year'}) endYear =
    new Date().getFullYear();
  /** Accessible label for the links. */
  @property({attribute: 'links-label'}) linksLabel = 'Social profiles';
  @state() private hasLinks = false;
  override render() {
    const years =
      this.startYear < this.endYear
        ? `${this.startYear}\u2013${this.endYear}`
        : String(this.endYear);
    return html`<footer part="surface">
      <span class="copyright">Copyright © ${years}, ${this.owner}</span>
      <nav aria-label=${this.linksLabel} ?hidden=${!this.hasLinks}>
        <slot
          @slotchange=${(event: Event) => {
            this.hasLinks =
              (event.target as HTMLSlotElement).assignedElements({
                flatten: true,
              }).length > 0;
          }}
        ></slot>
      </nav>
    </footer>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-site-footer': MaterialNextSiteFooter;
  }
}
