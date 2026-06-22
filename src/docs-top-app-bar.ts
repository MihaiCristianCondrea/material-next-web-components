/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './docs-top-app-bar-styles.js';

/** Sticky Material documentation app bar with leading, navigation, and trailing slots. */
@customElement('mnw-docs-top-app-bar')
export class MaterialNextDocsTopAppBar extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <div class="leading"><slot name="leading"></slot></div>
      <nav class="nav" aria-label="Primary"><slot></slot></nav>
      <div class="trailing"><slot name="trailing"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-docs-top-app-bar': MaterialNextDocsTopAppBar;
  }
}
