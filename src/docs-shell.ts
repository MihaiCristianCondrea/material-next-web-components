/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './docs-shell-styles.js';

/**
 * Application shell for Material Next documentation pages: a navigation slot,
 * the main landmark and a footer, in a full-height column.
 *
 * @slot nav - Top app bar, usually an `mnw-docs-top-app-bar`.
 * @slot - Page content, rendered inside `<main>`.
 * @slot footer - Footer content.
 */
@customElement('mnw-docs-shell')
export class MaterialNextDocsShell extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <slot name="nav"></slot>
      <main class="main"><slot></slot></main>
      <div class="footer"><slot name="footer"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-docs-shell': MaterialNextDocsShell;
  }
}
