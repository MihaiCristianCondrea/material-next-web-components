/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './docs-page-styles.js';

/** Centers documentation content with Material documentation spacing. */
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
