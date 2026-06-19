import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {WsTab} from './ws-tab.js';
import {wsTabsStyles} from './ws-tabs.styles.js';

export type WsTabsOrientation = 'horizontal' | 'vertical';

/**
 * Workshop tabs container for top-level navigation.
 *
 * @slot - One or more `ws-tab` elements.
 * @csspart tabs - The tablist container.
 * @csspart indicator - The animated active-tab indicator.
 */
@customElement('ws-tabs')
export class WsTabs extends LitElement {
  static override styles = wsTabsStyles;

  /** Accessible label forwarded to the internal tablist. */
  @property({attribute: 'aria-label'})
  accessibleLabel?: string;

  /** Visual and accessibility orientation for the tab list. */
  @property({reflect: true})
  orientation: WsTabsOrientation = 'horizontal';

  @query('.tabs')
  private tabsElement?: HTMLElement;

  @query('slot')
  private slotElement?: HTMLSlotElement;

  private hasMeasuredIndicator = false;
  private indicatorAnimationTimeout = 0;
  private indicatorUpdateFrame = 0;
  private lastSelectedTab: WsTab | null = null;

  private readonly mutationObserver = new MutationObserver(() => {
    this.scheduleIndicatorUpdate();
  });

  private readonly resizeObserver = new ResizeObserver(() => {
    this.scheduleIndicatorUpdate({animate: false});
  });

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize);
  }

  override disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    window.clearTimeout(this.indicatorAnimationTimeout);
    window.cancelAnimationFrame(this.indicatorUpdateFrame);
    this.mutationObserver.disconnect();
    this.resizeObserver.disconnect();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.observeTabs();
    this.updateIndicator({animate: false});
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('orientation')) {
      this.scheduleIndicatorUpdate({animate: false});
    }
  }

  override render() {
    return html`
      <div
        class="tabs"
        part="tabs"
        role="tablist"
        aria-label=${ifDefined(this.accessibleLabel)}
        aria-orientation=${this.orientation}
        @click=${this.selectClickedTab}
      >
        <div
          class="indicator"
          part="indicator"
          aria-hidden="true"
          @transitionend=${this.handleIndicatorTransitionEnd}
        ></div>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  private animateIndicator() {
    window.clearTimeout(this.indicatorAnimationTimeout);
    this.toggleAttribute('indicator-animated', true);
    // Ensure the transition style is active before indicator variables change.
    this.getBoundingClientRect();
    this.indicatorAnimationTimeout = window.setTimeout(() => {
      this.toggleAttribute('indicator-animated', false);
    }, 320);
  }

  private handleIndicatorTransitionEnd(event: TransitionEvent) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    ) {
      return;
    }

    window.clearTimeout(this.indicatorAnimationTimeout);
    this.toggleAttribute('indicator-animated', false);
  }

  private readonly handleResize = () => {
    this.scheduleIndicatorUpdate({animate: false});
  };

  private scheduleIndicatorUpdate(options: {animate?: boolean} = {}) {
    window.cancelAnimationFrame(this.indicatorUpdateFrame);
    this.indicatorUpdateFrame = window.requestAnimationFrame(() => {
      this.updateIndicator(options);
    });
  }

  private readonly updateIndicator = (options: {animate?: boolean} = {}) => {
    const tabsElement = this.tabsElement;
    const selectedTab = this.selectedTab;
    const selectedChanged = selectedTab !== this.lastSelectedTab;
    const shouldAnimate =
      options.animate !== false && this.hasMeasuredIndicator && selectedChanged;

    this.lastSelectedTab = selectedTab;

    if (!tabsElement || !selectedTab) {
      this.style.setProperty('--ws-tabs-indicator-opacity', '0');
      this.hasMeasuredIndicator = true;
      return;
    }

    if (shouldAnimate) {
      this.animateIndicator();
    }

    const hostRect = tabsElement.getBoundingClientRect();
    const selectedRect = selectedTab.getBoundingClientRect();

    if (this.orientation === 'vertical') {
      this.style.setProperty('--ws-tabs-indicator-inline-size', '3px');
      this.style.setProperty(
        '--ws-tabs-indicator-block-size',
        `${selectedRect.height}px`
      );
      this.style.setProperty('--ws-tabs-indicator-x', '0px');
      this.style.setProperty(
        '--ws-tabs-indicator-y',
        `${selectedRect.top - hostRect.top}px`
      );
    } else {
      this.style.setProperty(
        '--ws-tabs-indicator-inline-size',
        `${selectedRect.width}px`
      );
      this.style.setProperty('--ws-tabs-indicator-block-size', '3px');
      this.style.setProperty(
        '--ws-tabs-indicator-x',
        `${selectedRect.left - hostRect.left}px`
      );
      this.style.setProperty('--ws-tabs-indicator-y', '0px');
    }

    this.style.setProperty('--ws-tabs-indicator-opacity', '1');
    this.hasMeasuredIndicator = true;
  };

  private get selectedTab() {
    return this.tabs.find((tab) => tab.selected) ?? null;
  }

  private get tabs() {
    return (
      this.slotElement
        ?.assignedElements({flatten: true})
        .filter((element): element is WsTab => element instanceof WsTab) ?? []
    );
  }

  private observeTabs() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();

    if (this.tabsElement) this.resizeObserver.observe(this.tabsElement);
    this.tabs.forEach((tab) => {
      this.resizeObserver.observe(tab);
      this.mutationObserver.observe(tab, {
        attributeFilter: ['selected'],
        attributes: true,
      });
    });
  }

  private handleSlotChange() {
    this.observeTabs();
    this.scheduleIndicatorUpdate();
  }

  private selectClickedTab(event: MouseEvent) {
    const clickedTab = event
      .composedPath()
      .find((target): target is WsTab => target instanceof WsTab);

    if (
      !clickedTab ||
      clickedTab.hasAttribute('disabled') ||
      !this.tabs.includes(clickedTab)
    ) {
      return;
    }

    if (clickedTab.href.startsWith('#')) {
      event.preventDefault();
    }

    this.tabs.forEach((tab) => {
      tab.selected = tab === clickedTab;
    });

    this.scheduleIndicatorUpdate();

    this.dispatchEvent(
      new CustomEvent('ws-tab-change', {
        detail: {tab: clickedTab, href: clickedTab.href},
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-tabs': WsTabs;
  }
}
