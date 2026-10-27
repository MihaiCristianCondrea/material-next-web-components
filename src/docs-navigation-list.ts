/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing, type TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import type {DocsNavigationItem} from './docs-navigation.js';
import {
  createNavigationEvent,
  parseNavigationItemsJson,
} from './docs-navigation-controller.js';

/**
 * What `<mnw-docs-vertical-tabs>` and `<mnw-docs-table-of-contents>` share:
 * the items (as a property or JSON), the active index, the heading, and a
 * cancelable `navigate` on click. Each element draws its own items and sets
 * its own defaults.
 */
export abstract class DocsNavigationList extends LitElement {
  /** Index of the current item. Set by clicks; set it yourself when routing. */
  @property({type: Number, attribute: 'active-index'})
  activeIndex = 0;

  /**
   * The items as a JSON string, for server-rendered HTML. Invalid JSON, or
   * entries without a string `label` and `href`, are ignored.
   */
  @property({attribute: 'items-json'})
  itemsJson = '';

  abstract items: DocsNavigationItem[];
  abstract heading: string;

  /** The items' markup; `select(event, index)` handles a click. */
  protected abstract renderItems(): TemplateResult;

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('itemsJson')) {
      this.items = parseNavigationItemsJson(this.itemsJson, this.items);
    }
  }

  override render() {
    return html`
      <nav aria-label=${this.ariaLabel ?? ''}>
        ${this.heading ? html`<p class="heading">${this.heading}</p>` : nothing}
        ${this.renderItems()}
      </nav>
    `;
  }

  protected select(event: MouseEvent, index: number) {
    const item = this.items[index];
    if (!item) return;
    this.activeIndex = index;
    if (!this.dispatchEvent(createNavigationEvent(index, item))) {
      event.preventDefault();
    }
  }
}
