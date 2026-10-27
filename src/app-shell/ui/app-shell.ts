/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {prefersReducedMotion} from '../../internal/environment.js';
import {findActiveDestination} from '../domain/active-destination.js';
import {
  appShellLayoutPolicy,
  resolveNavigationMode,
  DEFAULT_PERMANENT_DRAWER_FROM,
  type AppShellLayoutPolicy,
  type AppShellNavigationMode,
} from '../domain/layout-policy.js';
import {styles} from './app-shell-styles.js';

export type AppShellLeading = 'menu' | 'back' | 'none';

export interface NavigationRequestDetail {
  /** The destination as written on the item (`/admin/feed`). */
  href: string;
  /** Its absolute URL. */
  url: string;
  /** The item or link that was activated. */
  item: Element;
}

export type NavigationRequestEvent = CustomEvent<NavigationRequestDetail>;
export type DrawerToggleEvent = CustomEvent<{open: boolean}>;
export type NavigationModeChangeEvent = CustomEvent<{
  mode: AppShellNavigationMode;
}>;

const DESTINATIONS = 'mnw-navigation-item, a[href]';

/**
 * An application's frame: a navigation drawer, a top app bar with the
 * screen's title and actions, and the screen. Below `permanent-from` (900px
 * of the shell's own width by default) the drawer is a modal sheet opened
 * from the menu button; from it, a permanent column beside a connected app
 * bar and content pane. The navigation is one DOM tree in both layouts, so
 * its state and listeners survive every resize.
 *
 * The shell never changes the URL. A tap on a destination fires a cancelable
 * `navigation-request`: a router calls `preventDefault()` and navigates
 * itself (or asks about unsaved changes first); without one, the link is
 * followed as usual. The app tells the shell where it is with `active-path`,
 * `heading` and `leading`.
 *
 * @slot - The screen.
 * @slot brand - The top of the drawer: a logo and the app's name.
 * @slot navigation - `<mnw-navigation-item>` elements, links, or groups of them with your own headings.
 * @slot navigation-footer - The bottom of the drawer: a theme picker, legal links.
 * @slot actions - The top app bar's trailing actions, for example `<mnw-product-launcher>`.
 * @fires navigation-request - Cancelable. `{href, url, item}`: a destination was activated. `preventDefault()` keeps the browser from following the link.
 * @fires back-request - The back button was pressed (`leading="back"`).
 * @fires drawer-toggle - `{open}`: the modal drawer opened or closed.
 * @fires navigation-mode-change - `{mode}`: the layout switched between `modal` and `permanent`.
 * @csspart drawer - The navigation drawer.
 * @csspart top-app-bar - The top app bar.
 * @csspart headline - The screen's title.
 * @csspart content - The `<main>` element around the screen.
 * @cssprop --mnw-app-shell-drawer-width - Width of the permanent drawer. Default `264px`.
 * @cssprop --mnw-app-shell-modal-drawer-width - Width of the modal drawer. Default `320px`, at most the window less 56px.
 * @cssprop --mnw-app-shell-top-app-bar-height - Height of the top app bar. Default `72px`, `64px` when the shell is narrower than 600px.
 * @cssprop --mnw-app-shell-pane-radius - The content pane's top-start corner beside the permanent drawer. Default `28px`.
 */
@customElement('mnw-app-shell')
export class MaterialNextAppShell extends LitElement {
  static override styles = styles;

  /** The current screen's title, in the top app bar. */
  @property()
  heading = '';

  /** The heading level of the title. */
  @property({type: Number, attribute: 'heading-level'})
  headingLevel = 1;

  /**
   * `menu` opens the modal drawer (hidden beside the permanent drawer),
   * `back` fires `back-request`, `none` shows nothing.
   */
  @property()
  leading: AppShellLeading = 'menu';

  /** The current path; defaults to `location.pathname`. Marks the current destination. */
  @property({attribute: 'active-path'})
  activePath = '';

  /** `auto` follows the layout policy; `modal` and `permanent` force a layout. */
  @property({attribute: 'navigation-mode'})
  navigationMode: 'auto' | AppShellNavigationMode = 'auto';

  /** The width, in CSS pixels of the shell, from which the drawer is permanent. */
  @property({type: Number, attribute: 'permanent-from'})
  permanentFrom = DEFAULT_PERMANENT_DRAWER_FROM;

  /** Replaces `permanent-from` with a full policy, for layouts with more rules. */
  @property({attribute: false})
  layoutPolicy?: AppShellLayoutPolicy;

  /** The modal drawer is open. Always false beside a permanent drawer. */
  @property({type: Boolean, reflect: true, attribute: 'drawer-open'})
  drawerOpen = false;

  /** The layout in use, `modal` or `permanent`. Set by the shell; read it, or style on it. */
  @property({reflect: true})
  layout: AppShellNavigationMode = 'modal';

  /** Content has scrolled under the top app bar. Set by the shell. */
  @property({type: Boolean, reflect: true})
  scrolled = false;

  /** Accessible name of the navigation landmark. */
  @property({attribute: 'navigation-label'})
  navigationLabel = 'Navigation';

  @state() private width = 0;

  @query('.drawer') private drawer?: HTMLElement;
  @query('.leading') private leadingButton?: HTMLElement;
  @query('.headline') private headline?: HTMLElement;
  @query('.sentinel') private sentinel?: HTMLElement;

  private resizeObserver?: ResizeObserver;
  private scrollObserver?: IntersectionObserver;
  private modalShown = false;
  /** Where focus goes when the modal drawer closes. */
  private focusAfterClose: 'trigger' | 'headline' | 'none' = 'trigger';
  /** Focused control to restore when the layout switches. */
  private focusBeforeSwitch?: {element: HTMLElement; area: 'drawer' | 'menu'};

  override connectedCallback() {
    super.connectedCallback();
    this.width = this.measure();
    this.resizeObserver = new ResizeObserver(() => {
      this.width = this.measure();
    });
    this.resizeObserver.observe(this);
    globalThis.addEventListener?.('popstate', this.onPopState);
  }

  override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.scrollObserver?.disconnect();
    this.scrollObserver = undefined;
    globalThis.removeEventListener?.('popstate', this.onPopState);
    super.disconnectedCallback();
  }

  /** Opens the modal drawer. Does nothing beside a permanent drawer. */
  openDrawer() {
    if (this.layout === 'modal') this.drawerOpen = true;
  }

  /** Closes the modal drawer and returns focus to the menu button. */
  closeDrawer() {
    this.focusAfterClose = 'trigger';
    this.drawerOpen = false;
  }

  toggleDrawer() {
    if (this.drawerOpen) this.closeDrawer();
    else this.openDrawer();
  }

  /** Moves focus to the screen's title, as after a navigation. */
  focusHeading() {
    this.headline?.focus({preventScroll: true});
  }

  private measure() {
    const width = this.getBoundingClientRect().width;
    return width || globalThis.innerWidth || 0;
  }

  private get policy() {
    return (
      this.layoutPolicy ??
      appShellLayoutPolicy({permanentFrom: this.permanentFrom})
    );
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    const layout =
      this.navigationMode === 'auto'
        ? resolveNavigationMode(this.width, this.policy)
        : this.navigationMode;
    if (layout !== this.layout) {
      const switched = this.hasUpdated;
      // Before render hides or moves the drawer, which would drop focus.
      if (switched) this.focusBeforeSwitch = this.focusBeforeLayoutSwitch();
      this.layout = layout;
      if (switched) {
        this.dispatchEvent(
          new CustomEvent('navigation-mode-change', {
            detail: {mode: layout},
            bubbles: true,
            composed: true,
          })
        );
      }
    }
    if (this.layout !== 'modal' && this.drawerOpen) {
      // A drawer left open off stage would trap focus in a hidden layer.
      this.focusAfterClose = 'none';
      this.drawerOpen = false;
    }
    if (changed.has('activePath')) this.markActive();
  }

  protected override firstUpdated() {
    // A 1px sentinel above the sticky bar: once it leaves the viewport,
    // content is under the bar. No scroll listener, no per-screen logic.
    this.scrollObserver = new IntersectionObserver(([entry]) => {
      this.scrolled = entry ? !entry.isIntersecting : false;
    });
    if (this.sentinel) this.scrollObserver.observe(this.sentinel);
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('drawerOpen') || changed.has('layout')) this.syncDrawer();
    if (changed.has('layout')) void this.restoreFocusAfterSwitch();
    const previous = changed.get('heading');
    if (changed.has('heading') && previous !== undefined) this.playHeading();
  }

  /** Capture focus before the old layout removes or hides its controls. */
  private focusBeforeLayoutSwitch():
    {element: HTMLElement; area: 'drawer' | 'menu'} | undefined {
    const root = this.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    if (
      active === this &&
      this.leading === 'menu' &&
      (this.renderRoot as ShadowRoot).activeElement === this.leadingButton &&
      this.leadingButton
    ) {
      return {element: this.leadingButton, area: 'menu'};
    }
    if (!(active instanceof HTMLElement) || !this.contains(active)) return;
    let child: Element | null = active;
    while (child && child.parentElement !== this) child = child.parentElement;
    const slot = child?.getAttribute('slot');
    if (
      slot !== 'brand' &&
      slot !== 'navigation' &&
      slot !== 'navigation-footer'
    )
      return;
    // Preserve the actual control inside a slotted component such as the
    // theme footer. Its host may not itself be focusable.
    let element = active;
    while (element.shadowRoot?.activeElement instanceof HTMLElement) {
      element = element.shadowRoot.activeElement;
    }
    return {element, area: 'drawer'};
  }

  /**
   * After a layout switch, focus stays where it was when the drawer is still
   * on screen (modal to permanent: the same nodes), and goes to the menu
   * button when the drawer has been put away (permanent to modal).
   */
  private async restoreFocusAfterSwitch() {
    const focused = this.focusBeforeSwitch;
    this.focusBeforeSwitch = undefined;
    if (!focused) return;
    if (this.layout === 'modal' && !this.drawerOpen) {
      // The menu button appeared in this update; its own button renders next.
      const button = this.leadingButton as
        (HTMLElement & {updateComplete?: Promise<unknown>}) | undefined;
      await button?.updateComplete;
      // A second switch may have happened while the Material button rendered.
      if (!this.isConnected || this.layout !== 'modal' || this.drawerOpen)
        return;
      if (button && button === this.leadingButton)
        button.focus({preventScroll: true});
      else this.focusHeading();
    } else if (focused.area === 'menu') {
      // The menu disappears beside a permanent drawer.
      const destination = this.currentDestination() ?? this.destinations()[0];
      if (destination) destination.focus({preventScroll: true});
      else this.focusHeading();
    } else {
      focused.element.focus({preventScroll: true});
    }
  }

  /** Shows or hides the modal drawer to match `drawerOpen` and the layout. */
  private syncDrawer() {
    const drawer = this.drawer;
    if (!drawer) return;
    const native = typeof drawer.showPopover === 'function';
    const open = this.layout === 'modal' && this.drawerOpen;
    if (open === this.modalShown) return;
    this.modalShown = open;
    if (open) {
      // The top layer escapes the transforms and stacking of the page.
      if (native && !drawer.matches(':popover-open')) drawer.showPopover();
      (this.currentDestination() ?? this.destinations()[0])?.focus();
    } else {
      if (native && drawer.matches(':popover-open')) drawer.hidePopover();
      const focus = this.focusAfterClose;
      this.focusAfterClose = 'trigger';
      if (focus === 'trigger') this.leadingButton?.focus();
      // After the router has rendered the new screen.
      if (focus === 'headline')
        requestAnimationFrame(() => this.focusHeading());
    }
    this.dispatchEvent(
      new CustomEvent('drawer-toggle', {
        detail: {open},
        bubbles: true,
        composed: true,
      })
    );
  }

  private playHeading() {
    if (prefersReducedMotion()) return;
    this.headline?.animate?.(
      [
        {opacity: 0, transform: 'translateY(4px)'},
        {opacity: 1, transform: 'none'},
      ],
      {duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)'}
    );
  }

  // Destinations ---------------------------------------------------------------

  private destinations(): HTMLElement[] {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name="navigation"]'
    );
    return (slot?.assignedElements({flatten: true}) ?? []).flatMap(
      (element) => [
        ...(element.matches(DESTINATIONS) ? [element as HTMLElement] : []),
        ...element.querySelectorAll<HTMLElement>(DESTINATIONS),
      ]
    );
  }

  private currentDestination() {
    return this.destinations().find(
      (item) =>
        (item as HTMLElement & {active?: boolean}).active ||
        item.getAttribute('aria-current') === 'page'
    );
  }

  private markActive() {
    const items = this.destinations();
    const base = globalThis.document?.baseURI;
    const path = this.activePath || globalThis.location?.pathname || '/';
    const index = findActiveDestination(
      items.map((item) => ({
        href: item.getAttribute('href') ?? '',
        match: item.getAttribute('match') === 'exact' ? 'exact' : 'prefix',
      })),
      path,
      base
    );
    items.forEach((item, i) => {
      if (item.localName === 'mnw-navigation-item') {
        (item as HTMLElement & {active: boolean}).active = i === index;
      } else if (i === index) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  private readonly onPopState = () => {
    if (!this.activePath) this.markActive();
  };

  private onNavigationClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0) return;
    // A modified click opens a new tab or window, as a link should.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const path = e.composedPath();
    const item = path.find(
      (node): node is HTMLElement =>
        node instanceof HTMLElement &&
        node.matches(DESTINATIONS) &&
        // The link inside an item's shadow root stands for the item.
        !(node.getRootNode() as ShadowRoot).host?.matches?.(
          'mnw-navigation-item'
        )
    );
    const href = item?.getAttribute('href');
    if (!item || !href) return;
    const target = item.getAttribute('target');
    if (target && target !== '_self') return;
    const request = new CustomEvent('navigation-request', {
      detail: {
        href,
        url: new URL(href, globalThis.document?.baseURI).href,
        item,
      },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    const handled = !this.dispatchEvent(request);
    if (handled) e.preventDefault();
    if (this.drawerOpen) {
      // The screen changes under the closing drawer; keyboard and screen
      // reader users land on its title.
      this.focusAfterClose = handled ? 'headline' : 'none';
      this.drawerOpen = false;
    }
  }

  // Modal drawer dismissal -------------------------------------------------

  private onDrawerKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.drawerOpen) {
      e.preventDefault();
      e.stopPropagation();
      this.closeDrawer();
    }
  }

  /**
   * A tap on the scrim. The popover's backdrop is not hit-tested and the
   * screen under it is inert, so the click lands on the frame around both.
   */
  private onFrameClick(e: MouseEvent) {
    if (!this.drawerOpen) return;
    const path = e.composedPath();
    if (this.drawer && path.includes(this.drawer)) return;
    // The menu button's own click, which just opened the drawer.
    if (this.leadingButton && path.includes(this.leadingButton)) return;
    this.closeDrawer();
  }

  private onLeading() {
    if (this.leading === 'back') {
      this.dispatchEvent(
        new CustomEvent('back-request', {bubbles: true, composed: true})
      );
      return;
    }
    this.toggleDrawer();
  }

  private skipToContent(e: Event) {
    e.preventDefault();
    this.renderRoot.querySelector<HTMLElement>('main')?.focus();
  }

  // Rendering --------------------------------------------------------------

  private renderLeading() {
    const back = this.leading === 'back';
    if (!back && (this.leading !== 'menu' || this.layout !== 'modal')) {
      return nothing;
    }
    return html`<md-icon-button
      class="leading"
      aria-label=${
        back ? 'Back' : this.drawerOpen ? 'Close navigation' : 'Open navigation'
      }
      title=${back ? 'Back' : 'Navigation'}
      aria-expanded=${ifDefined(
        back ? undefined : this.drawerOpen ? 'true' : 'false'
      )}
      @click=${this.onLeading}
    >
      <md-icon>${back ? 'arrow_back' : 'menu'}</md-icon>
    </md-icon-button>`;
  }

  override render() {
    const modal = this.layout === 'modal';
    const covered = modal && this.drawerOpen;
    return html`
      <a
        class="skip"
        href="#content"
        .inert=${covered}
        @click=${this.skipToContent}
        >Skip to content</a
      >
      <div
        class="frame ${this.width < 600 ? 'frame--compact' : ''}"
        @click=${this.onFrameClick}
      >
        <nav
          class="drawer"
          part="drawer"
          aria-label=${this.navigationLabel}
          .popover=${modal ? 'manual' : null}
          ?data-open=${covered}
          .inert=${modal && !this.drawerOpen}
          @keydown=${this.onDrawerKeyDown}
        >
          <div class="brand"><slot name="brand"></slot></div>
          <div class="destinations" @click=${this.onNavigationClick}>
            <slot
              name="navigation"
              @slotchange=${() => this.markActive()}
            ></slot>
          </div>
          <div class="footer"><slot name="navigation-footer"></slot></div>
        </nav>
        <div class="main" .inert=${covered}>
          <div class="sentinel" aria-hidden="true"></div>
          <header class="bar" part="top-app-bar">
            ${this.renderLeading()}
            <div
              class="headline"
              part="headline"
              role="heading"
              aria-level=${this.headingLevel}
              tabindex="-1"
            >
              ${this.heading}
            </div>
            <div class="actions"><slot name="actions"></slot></div>
          </header>
          <main id="content" class="content" part="content" tabindex="-1">
            <slot></slot>
          </main>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-app-shell': MaterialNextAppShell;
  }
  interface HTMLElementEventMap {
    'navigation-request': NavigationRequestEvent;
    'back-request': CustomEvent<void>;
    'drawer-toggle': DrawerToggleEvent;
    'navigation-mode-change': NavigationModeChangeEvent;
  }
}
