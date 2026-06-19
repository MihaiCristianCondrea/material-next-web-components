import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {wsDrawerStyles} from './ws-drawer.styles.js';
import './ws-drawer-item.js';

export interface WsDrawerItemClickDetail {
  itemId: string;
}

/**
 * Workshop tree navigation drawer container.
 *
 * @slot header - Optional drawer header content.
 * @slot - Drawer items, usually `ws-drawer-item` elements.
 * @slot footer - Optional drawer footer content.
 * @fires ws-drawer-item-click - Fired when a leaf drawer item is activated.
 */
@customElement('ws-drawer')
export class WsDrawer extends LitElement {
  static override styles = wsDrawerStyles;

  /** Item id that should be marked selected across slotted drawer items. */
  @property({attribute: 'selected-item-id'})
  selectedItemId = '';

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'ws-drawer-item-activate',
      this.onItemActivate as EventListener
    );
  }

  override disconnectedCallback() {
    this.removeEventListener(
      'ws-drawer-item-activate',
      this.onItemActivate as EventListener
    );
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <aside class="drawer">
        <div class="header"><slot name="header"></slot></div>
        <nav class="content" aria-label="Drawer navigation">
          <slot @slotchange=${this.syncSelection}></slot>
        </nav>
        <div class="footer"><slot name="footer"></slot></div>
      </aside>
    `;
  }

  protected override updated(changed: Map<string, unknown>) {
    if (changed.has('selectedItemId')) {
      this.syncSelection();
    }
  }

  private syncSelection = () => {
    const items = this.querySelectorAll('ws-drawer-item');
    items.forEach((item) => {
      item.toggleAttribute(
        'selected',
        item.getAttribute('item-id') === this.selectedItemId
      );
    });
  };

  private onItemActivate = (event: CustomEvent<WsDrawerItemClickDetail>) => {
    event.stopPropagation();
    const {itemId} = event.detail;

    this.dispatchEvent(
      new CustomEvent<WsDrawerItemClickDetail>('ws-drawer-item-click', {
        bubbles: true,
        composed: true,
        detail: {itemId},
      })
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-drawer': WsDrawer;
  }

  interface HTMLElementEventMap {
    'ws-drawer-item-click': CustomEvent<WsDrawerItemClickDetail>;
  }
}
