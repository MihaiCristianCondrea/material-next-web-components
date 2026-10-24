/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './prototype-layout-styles.js';

/**
 * The prototype page's frame: a stage for the live screen and a side panel.
 *
 * @slot stage - Light-DOM container the screen hosts render into.
 * @slot panel - Usually an `mnw-screen-inspector`.
 */
@customElement('mnw-prototype-layout')
export class MaterialNextPrototypeLayout extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <section class="stage" aria-label="Screen preview">
        <slot name="stage"></slot>
      </section>
      <aside class="panel"><slot name="panel"></slot></aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-prototype-layout': MaterialNextPrototypeLayout;
  }
}
