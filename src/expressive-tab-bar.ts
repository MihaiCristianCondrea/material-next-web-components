/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/tabs.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {repeat} from 'lit/directives/repeat.js';
import {
  type DocsNavigationItem,
  exampleNavigationItems,
} from './docs-navigation.js';
import {styles} from './expressive-tab-bar-styles.js';

export type ExpressiveTabIconPosition = 'top' | 'bottom' | 'start' | 'end';

export type ExpressiveTabItem = DocsNavigationItem;

const defaultTabs: ExpressiveTabItem[] = exampleNavigationItems;

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

  /** Places tab icons before, after, above, or below tab labels. */
  @property({attribute: 'icon-position', reflect: true})
  iconPosition: ExpressiveTabIconPosition = 'top';

  /** Tab item data. Set this property from JavaScript for custom labels. */
  @property({attribute: false})
  tabs: ExpressiveTabItem[] = defaultTabs;

  private skipNextMaterialTabsNavigation = false;

  override render() {
    const activeIndex = this.clampedActiveIndex;
    const iconPosition = this.normalizedIconPosition;

    return html`
      <nav aria-label=${this.ariaLabel}>
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
                .inlineIcon=${iconPosition === 'start' ||
                iconPosition === 'end'}
                @click=${(event: MouseEvent) =>
                  this.handleTabClick(event, index)}
              >
                <span
                  class=${classMap({
                    'tab-content': true,
                    [`icon-${iconPosition}`]: true,
                  })}
                >
                  ${tab.icon
                    ? html`<md-icon class="tab-icon">${tab.icon}</md-icon>`
                    : nothing}
                  ${tab.href
                    ? html`<a class="tab-link" href=${tab.href}
                        >${tab.label}</a
                      >`
                    : html`<span class="tab-label">${tab.label}</span>`}
                </span>
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

  private get normalizedIconPosition(): ExpressiveTabIconPosition {
    if (
      this.iconPosition === 'bottom' ||
      this.iconPosition === 'start' ||
      this.iconPosition === 'end'
    ) {
      return this.iconPosition;
    }

    return 'top';
  }

  private handleMaterialTabsChange(event: Event) {
    const tabs = event.currentTarget as HTMLElement & {activeTabIndex: number};
    if (this.skipNextMaterialTabsNavigation) {
      this.skipNextMaterialTabsNavigation = false;
      return;
    }

    this.activateAndNavigate(tabs.activeTabIndex);
  }

  private handleTabClick(event: MouseEvent, index: number) {
    this.skipNextMaterialTabsNavigation = true;
    queueMicrotask(() => {
      this.skipNextMaterialTabsNavigation = false;
    });
    this.activateAndNavigate(index, event);
  }

  private activateAndNavigate(index: number, event?: Event) {
    const item = this.tabs[index];
    if (!item) {
      return;
    }

    this.activateTab(index);

    if (!item.href) {
      return;
    }

    const navigateEvent = new CustomEvent('navigate', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {index, item},
    });

    if (!this.dispatchEvent(navigateEvent)) {
      event?.preventDefault();
    }
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
