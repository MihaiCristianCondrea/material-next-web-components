/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './docs-page-styles.js';

/**
 * Centers documentation content with Material documentation spacing.
 *
 * @slot - Page content.
 * @cssprop --mnw-docs-page-max-width - Maximum content width. Default `1120px`.
 * @cssprop --mnw-docs-page-inline-gutter - Total inline space kept free. Default `32px`.
 * @cssprop --mnw-docs-page-padding-block - Top padding. Default `32px`, `24px` below 820px.
 */
@customElement('mnw-docs-page')
export class MaterialNextDocsPage extends LitElement {
  static override styles = styles;

  override render() {
    return html`<div class="docs-content"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-docs-page': MaterialNextDocsPage;
  }
}
