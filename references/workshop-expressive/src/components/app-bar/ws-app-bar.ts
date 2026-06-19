import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {wsAppBarStyles} from './ws-app-bar.styles.js';

/**
 * A translucent top app bar with slots for navigation, content, and actions.
 */
@customElement('ws-app-bar')
export class WsAppBar extends LitElement {
  static override styles = wsAppBarStyles;

  /** Accessible label for the app bar navigation landmark. */
  @property({type: String, attribute: 'aria-label'})
  label = 'Top app bar';

  /** Keeps the app bar pinned to the top of its scroll container. */
  @property({type: Boolean, reflect: true})
  sticky = false;

  override render() {
    return html`
      <nav class="app-bar" aria-label=${this.label}>
        <div class="leading">
          <slot name="leading"></slot>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="trailing">
          <slot name="trailing"></slot>
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-app-bar': WsAppBar;
  }
}
