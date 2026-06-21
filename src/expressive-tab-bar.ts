/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/tabs.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {styles} from './expressive-tab-bar-styles.js';

export interface ExpressiveTabItem {
  label: string;
  icon?: string;
  href?: string;
}

const defaultTabs: ExpressiveTabItem[] = [
  {label: 'Overview', icon: 'info', href: '#overview'},
  {label: 'Specs', icon: 'style', href: '#specs'},
  {label: 'Guidelines', icon: 'design_services', href: '#guidelines'},
  {label: 'Accessibility', icon: 'accessibility_new', href: '#accessibility'},
];

/**
 * A Material 3 expressive top app tab bar styled with rounded app-navigation
 * chrome and Material Web tabs.
 *
 * @fires change - Fired when the selected tab changes.
 * @csspart tabs - The underlying Material Web tabs element.
 * @csspart tab - Each Material Web primary tab.
 */
@customElement('md-expressive-tab-bar')
export class MdExpressiveTabBar extends LitElement {
  static override styles = styles;

  /** Accessible label for the navigation landmark. */
  @property({attribute: 'aria-label'})
  override ariaLabel = 'Article tabs';

  /** Index of the active tab. */
  @property({type: Number, attribute: 'active-index'})
  activeIndex = 0;

  /** Tab item data. Set this property from JavaScript for custom labels. */
  @property({attribute: false})
  tabs: ExpressiveTabItem[] = defaultTabs;

  override render() {
    const activeIndex = this.clampedActiveIndex;

    return html`
      <nav aria-label=${this.ariaLabel} role="presentation">
        <md-tabs
          part="tabs"
          .activeTabIndex=${activeIndex}
          @change=${this.handleMaterialTabsChange}
        >
          ${repeat(
            this.tabs,
            (tab) => `${tab.label}-${tab.href ?? ''}`,
            (tab, index) => html`
              <md-primary-tab
                part="tab"
                aria-label=${tab.label}
                ?active=${index === activeIndex}
                @click=${(event: MouseEvent) =>
                  this.handleTabClick(event, index)}
              >
                ${tab.icon
                  ? html`<md-icon slot="icon">${tab.icon}</md-icon>`
                  : nothing}
                ${tab.href
                  ? html`<a class="tab-link" href=${tab.href}>${tab.label}</a>`
                  : tab.label}
              </md-primary-tab>
            `
          )}
        </md-tabs>
      </nav>
    `;
  }

  private get clampedActiveIndex() {
    return Math.min(Math.max(this.activeIndex, 0), this.tabs.length - 1);
  }

  private handleMaterialTabsChange(event: Event) {
    const tabs = event.currentTarget as HTMLElement & {activeTabIndex: number};
    this.activateTab(tabs.activeTabIndex);
  }

  private handleTabClick(event: MouseEvent, index: number) {
    const item = this.tabs[index];
    this.activateTab(index);

    if (!item.href) {
      return;
    }

    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('navigate', {
        bubbles: true,
        composed: true,
        detail: {index, item},
      })
    );
  }

  private activateTab(index: number) {
    if (index === this.activeIndex || index < 0 || index >= this.tabs.length) {
      return;
    }

    this.activeIndex = index;
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {activeIndex: index, item: this.tabs[index]},
      })
    );
  }
}

/** Backwards-friendly alias for product code that prefers the mnw prefix. */
@customElement('mnw-expressive-tab-bar')
export class MaterialNextExpressiveTabBar extends MdExpressiveTabBar {}

declare global {
  interface HTMLElementTagNameMap {
    'md-expressive-tab-bar': MdExpressiveTabBar;
    'mnw-expressive-tab-bar': MaterialNextExpressiveTabBar;
  }
}
