/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './docs-top-app-bar-styles.js';

/**
 * Sticky Material documentation app bar with leading, navigation, and trailing
 * slots. Below 960px the navigation moves to a scrolling row under the brand
 * and actions; below 600px the bar scrolls away with the page.
 *
 * @slot leading - Brand or logo link.
 * @slot - Primary navigation, for example `md-tabs` with links.
 * @slot trailing - Actions such as a repository link.
 */
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
