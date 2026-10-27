/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {repeat} from 'lit/directives/repeat.js';
import {
  type DocsNavigationItem,
  exampleTableOfContentsItems,
} from './docs-navigation.js';
import {DocsNavigationList} from './docs-navigation-list.js';
import {styles} from './docs-table-of-contents-styles.js';

/**
 * "On this page" links for a documentation page. The active link has
 * `aria-current="page"`.
 *
 * @fires navigate - `{index, item}` when an item is clicked, after it becomes
 *   active. Cancelable: `preventDefault()` keeps the browser from following the
 *   link, for routing in JavaScript.
 */
@customElement('mnw-docs-table-of-contents')
export class MaterialNextDocsTableOfContents extends DocsNavigationList {
  static override styles = styles;

  /** Accessible name of the navigation landmark. */
  @property({attribute: 'aria-label'})
  override ariaLabel = 'Table of contents';

  /** Visible heading above the items; an empty string hides it. */
  @property()
  heading = 'On this page';

  /**
   * The items, as `{label, href, icon?}` objects. JavaScript property. The
   * default is four placeholder `#` anchors; always set it or `items-json`.
   */
  @property({attribute: false})
  items: DocsNavigationItem[] = exampleTableOfContentsItems;

  protected renderItems() {
    return html`${repeat(
      this.items,
      (item) => `${item.label}-${item.href}`,
      (item, index) => html`
        <a
          href=${item.href}
          aria-current=${ifDefined(
            index === this.activeIndex ? 'page' : undefined
          )}
          @click=${(event: MouseEvent) => this.select(event, index)}
          >${item.label}</a
        >
      `
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-docs-table-of-contents': MaterialNextDocsTableOfContents;
  }
}
