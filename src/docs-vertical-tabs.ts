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
import {styles} from './docs-vertical-tabs-styles.js';

@customElement('mnw-docs-vertical-tabs')
export class MaterialNextDocsVerticalTabs extends LitElement {
  static override styles = styles;

  @property({attribute: 'aria-label'})
  override ariaLabel = 'Documentation sections';

  @property()
  heading = 'Elements';

  @property({type: Number, attribute: 'active-index'})
  activeIndex = 0;

  @property({attribute: false})
  items: DocsNavigationItem[] = exampleNavigationItems;

  @property({attribute: 'items-json'})
  itemsJson = '';

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('itemsJson') && this.itemsJson) {
      try {
        const items = JSON.parse(this.itemsJson) as DocsNavigationItem[];
        if (Array.isArray(items)) {
          this.items = items;
        }
      } catch {
        // Ignore malformed declarative data and keep the current items.
      }
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
                ${item.icon
                  ? html`<md-icon slot="start">${item.icon}</md-icon>`
                  : nothing}
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
    const navigateEvent = new CustomEvent('navigate', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {index, item},
    });
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
