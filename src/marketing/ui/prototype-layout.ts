/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './prototype-layout-styles.js';

/**
 * The prototype page's frame: a side panel on the leading side, where the
 * back button and the controls start, and a stage for the live screen.
 *
 * @slot stage - Light-DOM container the screen hosts render into.
 * @slot panel - Usually an `mnw-screen-inspector`.
 */
@customElement('mnw-prototype-layout')
export class MaterialNextPrototypeLayout extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <aside class="panel"><slot name="panel"></slot></aside>
      <section class="stage" aria-label="Screen preview">
        <slot name="stage"></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-prototype-layout': MaterialNextPrototypeLayout;
  }
}
