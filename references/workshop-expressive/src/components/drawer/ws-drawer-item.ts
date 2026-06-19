import {LitElement, html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {customElement, property, state} from 'lit/decorators.js';
import {wsDrawerItemStyles} from './ws-drawer-item.styles.js';
import type {WsDrawerItemClickDetail} from './ws-drawer.js';

/**
 * Workshop tree navigation drawer item.
 *
 * @slot icon - Optional leading icon content.
 * @slot - Nested `ws-drawer-item` children.
 */
@customElement('ws-drawer-item')
export class WsDrawerItem extends LitElement {
  static override styles = wsDrawerItemStyles;

  /** Stable id used for selection and click event details. */
  @property({attribute: 'item-id'})
  itemId = '';

  /** Primary item label. */
  @property()
  override title = '';

  /** Optional icon CSS class rendered before the title. Prefer the `icon` slot for app-chosen icon libraries. */
  @property()
  icon = '';

  /** Secondary item label. */
  @property()
  subtitle = '';

  /** Optional trailing badge text. */
  @property()
  badge = '';

  /** Optional progress value from 0 to 1. */
  @property({type: Number})
  progress?: number;

  /** Disables item activation. */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /** Expands nested drawer item children. */
  @property({type: Boolean, reflect: true})
  expanded = false;

  /** Applies selected visual state. Usually synchronized by `ws-drawer`. */
  @property({type: Boolean, reflect: true})
  selected = false;

  @state()
  private hasChildren = false;

  override connectedCallback() {
    super.connectedCallback();
    this.updateTreeState();
  }

  override render() {
    const level = this.getNestingLevel();
    const progressValue = this.clampedProgress;
    this.toggleAttribute('data-nested', level > 0);
    this.toggleAttribute('data-has-children', this.hasChildren);
    this.style.setProperty('--ws-drawer-item-depth', String(level));

    return html`
      <div
        class="item"
        role="button"
        tabindex=${this.disabled ? '-1' : '0'}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-expanded=${ifDefined(
          this.hasChildren ? (this.expanded ? 'true' : 'false') : undefined
        )}
        @click=${this.onClick}
        @keydown=${this.onKeydown}
      >
        ${this.renderLeadingIcon()}

        <div class="text">
          <span class="title">${this.title}</span>
          ${this.subtitle
            ? html`<span class="subtitle">${this.subtitle}</span>`
            : nothing}
          ${progressValue === undefined || progressValue >= 1
            ? nothing
            : this.renderProgress(progressValue)}
        </div>

        ${progressValue !== undefined && progressValue >= 1
          ? this.renderCompleteIcon()
          : nothing}
        ${this.badge ? html`<span class="badge">${this.badge}</span>` : nothing}
        ${this.hasChildren ? this.renderDisclosureIcon() : nothing}
      </div>

      <div
        class="children"
        aria-hidden=${this.hasChildren && !this.expanded ? 'true' : 'false'}
      >
        <div class="children-inner">
          <slot @slotchange=${this.updateTreeState}></slot>
        </div>
      </div>
    `;
  }

  private renderLeadingIcon() {
    const hasSlottedIcon = this.querySelector('[slot="icon"]') !== null;
    const shouldShowBullet =
      this.getNestingLevel() > 0 && !this.icon && !hasSlottedIcon;

    if (this.icon || hasSlottedIcon) {
      return html`<span class="icon" aria-hidden="true"
        ><slot name="icon">${this.renderIconClass()}</slot></span
      >`;
    }

    if (shouldShowBullet) {
      return html`<span class="bullet" aria-hidden="true"></span>`;
    }

    return html`<span class="icon" aria-hidden="true"
      ><slot name="icon"></slot
    ></span>`;
  }

  private renderIconClass() {
    return this.icon
      ? html`<i class=${this.icon} aria-hidden="true"></i>`
      : nothing;
  }

  private renderDisclosureIcon() {
    return html`
      <span class="arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            d="M12 15.5 5.5 9l1.4-1.4 5.1 5.1 5.1-5.1L18.5 9 12 15.5Z"
          ></path>
        </svg>
      </span>
    `;
  }

  private renderCompleteIcon() {
    return html`
      <span class="complete-icon" role="img" aria-label="Complete">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path
            d="M9.55 17.45 4.8 12.7l1.4-1.4 3.35 3.35 8.25-8.25 1.4 1.4-9.65 9.65Z"
          ></path>
        </svg>
      </span>
    `;
  }

  private renderProgress(progressValue: number) {
    return html`
      <div
        class="progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="1"
        aria-valuenow=${progressValue}
      >
        <div
          class="progress-fill"
          style=${`inline-size: ${progressValue * 100}%`}
        ></div>
      </div>
    `;
  }

  private onClick(event: MouseEvent) {
    event.stopPropagation();
    this.activate();
  }

  private onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activate();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusSibling(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusSibling(-1);
        break;
      case 'ArrowRight':
        if (this.hasChildren && !this.expanded) {
          event.preventDefault();
          this.expanded = true;
        }
        break;
      case 'ArrowLeft':
        if (this.hasChildren && this.expanded) {
          event.preventDefault();
          this.expanded = false;
          return;
        }

        if (this.focusParentItem()) {
          event.preventDefault();
        }
        break;
    }
  }

  private focusSibling(direction: 1 | -1) {
    const items = this.getVisibleDrawerItems();
    const currentIndex = items.indexOf(this);
    const nextItem = items[currentIndex + direction];

    nextItem?.focusItem();
  }

  private focusParentItem() {
    const parent = this.parentElement?.closest<WsDrawerItem>('ws-drawer-item');
    if (!parent) {
      return false;
    }

    parent.focusItem();
    return true;
  }

  private focusItem() {
    this.shadowRoot?.querySelector<HTMLElement>('.item')?.focus();
  }

  private getVisibleDrawerItems() {
    const root = (this.closest('ws-drawer') ??
      this.getRootNode()) as ParentNode;
    return Array.from(
      root.querySelectorAll<WsDrawerItem>('ws-drawer-item')
    ).filter((item) => item.isVisibleDrawerItem());
  }

  private isVisibleDrawerItem() {
    if (this.disabled) {
      return false;
    }

    let parent = this.parentElement?.closest<WsDrawerItem>('ws-drawer-item');
    while (parent) {
      if (!parent.expanded) {
        return false;
      }
      parent = parent.parentElement?.closest<WsDrawerItem>('ws-drawer-item');
    }

    return true;
  }

  private activate() {
    if (this.disabled) {
      return;
    }

    if (this.hasChildren) {
      this.expanded = !this.expanded;
      return;
    }

    if (this.itemId === 'settings') {
      this.animateSettingsIcon();
    }

    this.dispatchEvent(
      new CustomEvent<WsDrawerItemClickDetail>('ws-drawer-item-activate', {
        bubbles: true,
        composed: true,
        detail: {itemId: this.itemId},
      })
    );
  }

  private animateSettingsIcon() {
    this.toggleAttribute('data-settings-spin', false);

    window.requestAnimationFrame(() => {
      this.toggleAttribute('data-settings-spin', true);
      window.setTimeout(() => {
        this.toggleAttribute('data-settings-spin', false);
      }, 360);
    });
  }

  private updateTreeState() {
    this.hasChildren = this.querySelector('ws-drawer-item') !== null;
    this.querySelectorAll<WsDrawerItem>('ws-drawer-item').forEach((item) =>
      item.requestUpdate()
    );
  }

  private getNestingLevel() {
    let level = 0;
    let parent = this.parentElement;

    while (parent) {
      if (parent.localName === 'ws-drawer-item') {
        level += 1;
      }
      parent = parent.parentElement;
    }

    return level;
  }

  private get clampedProgress() {
    if (this.progress === undefined || Number.isNaN(this.progress)) {
      return undefined;
    }

    return Math.min(1, Math.max(0, this.progress));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-drawer-item': WsDrawerItem;
  }

  interface HTMLElementEventMap {
    'ws-drawer-item-activate': CustomEvent<WsDrawerItemClickDetail>;
  }
}
