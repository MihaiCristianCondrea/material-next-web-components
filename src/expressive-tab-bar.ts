/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/tabs.js';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {repeat} from 'lit/directives/repeat.js';
import {
  type DocsNavigationItem,
  exampleNavigationItems,
} from './docs-navigation.js';
import {styles} from './expressive-tab-bar-styles.js';
import {prefersReducedMotion} from './internal/environment.js';

const INDICATOR_DURATION = 350;

export type ExpressiveTabIconPosition = 'top' | 'bottom' | 'start' | 'end';

export type ExpressiveTabItem = DocsNavigationItem;

const defaultTabs: ExpressiveTabItem[] = exampleNavigationItems;

/**
 * A Material 3 expressive top app tab bar styled with rounded app-navigation
 * chrome and Material Web tabs.
 *
 * @fires change - `{activeIndex, item}` after the selected tab changes.
 * @fires navigate - `{index, item}` before following a tab's `href`. Cancelable:
 *   `preventDefault()` keeps the browser from following the link, for routing
 *   in JavaScript.
 * @cssprop --mnw-expressive-tab-bar-container-color - Bar background.
 * @cssprop --mnw-expressive-tab-bar-on-container - Inactive label and icon colour.
 * @cssprop --mnw-expressive-tab-bar-active-container - Active tab background.
 * @cssprop --mnw-expressive-tab-bar-on-active-container - Active label and icon colour.
 * @cssprop --mnw-expressive-tab-bar-shape - Corner radius. Default `999px`.
 * @cssprop --mnw-expressive-tab-bar-height - Tab height. Default `80px`.
 * @cssprop --mnw-expressive-tab-min-width - Minimum tab width.
 * @cssprop --mnw-expressive-tab-padding-inline - Tab inline padding.
 * @csspart tabs - The underlying Material Web tabs element.
 * @csspart tab - Each Material Web primary tab.
 */
@customElement('mnw-expressive-tab-bar')
export class MaterialNextExpressiveTabBar extends LitElement {
  static override styles = styles;

  /** Accessible label for the navigation landmark. */
  @property({attribute: 'aria-label'})
  override ariaLabel = 'Article tabs';

  /** Index of the active tab. */
  @property({type: Number, attribute: 'active-index'})
  activeIndex = 0;

  /** Places tab icons before, after, above, or below tab labels. */
  @property({attribute: 'icon-position', reflect: true})
  iconPosition: ExpressiveTabIconPosition = 'start';

  /**
   * The tabs, as `{label, href, icon?}` objects. JavaScript property only. The
   * default is three placeholder tabs linking to `#` anchors; always set it.
   */
  @property({attribute: false})
  tabs: ExpressiveTabItem[] = defaultTabs;

  private skipNextMaterialTabsNavigation = false;
  private resizeObserver?: ResizeObserver;
  private scrollingRoot?: ShadowRoot;
  private indicatorAnimation?: Animation;
  private indicatorReady = false;

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(
      () => void this.positionIndicator(false)
    );
    this.resizeObserver.observe(this);
    void document.fonts?.ready.then(() => this.positionIndicator(false));
  }

  override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.scrollingRoot?.removeEventListener('scroll', this.onScroll, true);
    this.scrollingRoot = undefined;
    this.indicatorAnimation?.cancel();
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    void this.positionIndicator(changed.has('activeIndex'));
  }

  private readonly onScroll = () => void this.positionIndicator(false);

  private async positionIndicator(animate: boolean) {
    const tabs = this.renderRoot.querySelector<
      HTMLElement & {updateComplete: Promise<unknown>}
    >('md-tabs');
    if (!tabs) return;
    await tabs.updateComplete;
    const items = [
      ...tabs.querySelectorAll<
        HTMLElement & {updateComplete: Promise<unknown>}
      >('md-primary-tab'),
    ];
    await Promise.all(items.map((item) => item.updateComplete));
    if (!this.isConnected) return;
    if (tabs.shadowRoot && this.scrollingRoot !== tabs.shadowRoot) {
      this.scrollingRoot?.removeEventListener('scroll', this.onScroll, true);
      this.scrollingRoot = tabs.shadowRoot;
      this.scrollingRoot.addEventListener('scroll', this.onScroll, true);
    }
    const indicator = this.renderRoot.querySelector<HTMLElement>('.selection');
    const track = this.renderRoot.querySelector<HTMLElement>('nav');
    const selected = items[this.clampedActiveIndex];
    if (!indicator || !track) return;
    indicator.hidden = !selected;
    if (!selected) return;
    // Where the selection is drawn now, mid-slide included.
    const before = indicator.getBoundingClientRect();
    const parent = track.getBoundingClientRect();
    const target = selected.getBoundingClientRect();
    // A scroll or resize during a slide (md-tabs scrolls the new tab into
    // view) retargets the slide for its remaining time instead of snapping.
    const running = this.indicatorAnimation?.playState === 'running';
    const elapsed = Number(this.indicatorAnimation?.currentTime ?? 0);
    const duration = animate
      ? INDICATOR_DURATION
      : running
        ? Math.max(0, INDICATOR_DURATION - elapsed)
        : 0;
    this.indicatorAnimation?.cancel();
    const left = target.left - parent.left;
    indicator.style.left = `${left}px`;
    indicator.style.width = `${target.width}px`;
    if (duration > 0 && this.indicatorReady && !prefersReducedMotion()) {
      this.indicatorAnimation = indicator.animate(
        [
          {left: `${before.left - parent.left}px`, width: `${before.width}px`},
          {left: `${left}px`, width: `${target.width}px`},
        ],
        {duration, easing: 'cubic-bezier(0.2, 0, 0, 1)'}
      );
    }
    this.indicatorReady = true;
  }

  override render() {
    const activeIndex = this.clampedActiveIndex;
    const iconPosition = this.normalizedIconPosition;

    return html`
      <nav aria-label=${this.ariaLabel}>
        <span class="selection" aria-hidden="true"></span>
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
                .inlineIcon=${
                  iconPosition === 'start' || iconPosition === 'end'
                }
                @click=${(event: MouseEvent) =>
                  this.handleTabClick(event, index)}
              >
                <span
                  class=${classMap({
                    'tab-content': true,
                    [`icon-${iconPosition}`]: true,
                  })}
                >
                  ${
                    tab.icon
                      ? html`<md-icon class="tab-icon">${tab.icon}</md-icon>`
                      : nothing
                  }
                  ${
                    tab.href
                      ? html`<a
                          class="tab-link"
                          href=${tab.href}
                          tabindex="-1"
                          @click=${(event: MouseEvent) => this.handleLinkClick(event, index)}
                          >${tab.label}</a
                        >`
                      : html`<span class="tab-label">${tab.label}</span>`
                  }
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

    return this.iconPosition === 'top' ? 'top' : 'start';
  }

  private handleMaterialTabsChange(event: Event) {
    const tabs = event.currentTarget as HTMLElement & {activeTabIndex: number};
    if (this.skipNextMaterialTabsNavigation) {
      this.skipNextMaterialTabsNavigation = false;
      return;
    }

    if (tabs.activeTabIndex === this.clampedActiveIndex) return;
    if (this.activateAndNavigate(tabs.activeTabIndex, event)) {
      window.location.assign(this.tabs[tabs.activeTabIndex].href);
    }
  }

  private handleLinkClick(event: MouseEvent, index: number) {
    // Keep the original anchor event: canceling a synthetic host click cannot
    // cancel an anchor's separate default navigation.
    event.stopPropagation();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    this.activateAndNavigate(index, event);
  }

  private handleTabClick(event: MouseEvent, index: number) {
    this.skipNextMaterialTabsNavigation = true;
    queueMicrotask(() => {
      this.skipNextMaterialTabsNavigation = false;
    });
    if (this.activateAndNavigate(index, event)) {
      window.location.assign(this.tabs[index].href);
    }
  }

  private activateAndNavigate(index: number, event?: Event): boolean {
    const item = this.tabs[index];
    if (!item) return false;
    this.activateTab(index);

    if (!item.href) return false;

    const navigateEvent = new CustomEvent('navigate', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {index, item},
    });

    const accepted = this.dispatchEvent(navigateEvent);
    if (!accepted) event?.preventDefault();
    return accepted;
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

declare global {
  interface HTMLElementTagNameMap {
    'mnw-expressive-tab-bar': MaterialNextExpressiveTabBar;
  }
}
