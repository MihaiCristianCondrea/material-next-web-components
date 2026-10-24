/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/list/list-item.js';
import '@material/web/list/list.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {repeat} from 'lit/directives/repeat.js';
import {
  type DocsNavigationItem,
  exampleNavigationItems,
} from './docs-navigation.js';
import {
  createNavigationEvent,
  parseNavigationItemsJson,
} from './docs-navigation-controller.js';
import {styles} from './docs-vertical-tabs-styles.js';

/**
 * Vertical navigation list for documentation sections, built on Material Web
 * list items. Each item is a link; the active one has `aria-current="page"`.
 *
 * @fires navigate - `{index, item}` when an item is clicked, after it becomes
 *   active. Cancelable: `preventDefault()` keeps the browser from following the
 *   link, for routing in JavaScript.
 */
@customElement('mnw-docs-vertical-tabs')
export class MaterialNextDocsVerticalTabs extends LitElement {
  static override styles = styles;

  /** Accessible name of the navigation landmark. */
  @property({attribute: 'aria-label'})
  override ariaLabel = 'Documentation sections';

  /** Visible heading above the items; an empty string hides it. */
  @property()
  heading = 'Elements';

  /** Index of the current item. Set by clicks; set it yourself when routing. */
  @property({type: Number, attribute: 'active-index'})
  activeIndex = 0;

  /**
   * The items, as `{label, href, icon?}` objects. JavaScript property. The
   * default is three placeholder example links; always set it or `items-json`.
   */
  @property({attribute: false})
  items: DocsNavigationItem[] = exampleNavigationItems;

  /**
   * The items as a JSON string, for server-rendered HTML. Invalid JSON, or
   * entries without a string `label` and `href`, are ignored.
   */
  @property({attribute: 'items-json'})
  itemsJson = '';

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('itemsJson')) {
      this.items = parseNavigationItemsJson(this.itemsJson, this.items);
    }
  }

  override render() {
    return html`
      <nav aria-label=${this.ariaLabel}>
        ${this.heading ? html`<p class="heading">${this.heading}</p>` : nothing}
        <md-list>
          ${repeat(
            this.items,
            (item) => `${item.label}-${item.href}`,
            (item, index) => html`
              <md-list-item
                type="link"
                href=${item.href}
                class=${index === this.activeIndex ? 'item active' : 'item'}
                aria-current=${ifDefined(
                  index === this.activeIndex ? 'page' : undefined
                )}
                @click=${(event: MouseEvent) =>
                  this.handleItemClick(event, index)}
              >
                ${
                  item.icon
                    ? html`<md-icon slot="start">${item.icon}</md-icon>`
                    : nothing
                }
                <span>${item.label}</span>
              </md-list-item>
            `
          )}
        </md-list>
      </nav>
    `;
  }

  private handleItemClick(event: MouseEvent, index: number) {
    const item = this.items[index];
    if (!item) {
      return;
    }

    this.activeIndex = index;
    const navigateEvent = createNavigationEvent(index, item);
    if (!this.dispatchEvent(navigateEvent)) {
      event.preventDefault();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-docs-vertical-tabs': MaterialNextDocsVerticalTabs;
  }
}
