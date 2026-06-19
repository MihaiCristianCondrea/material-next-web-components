import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {wsTabStyles} from './ws-tab.styles.js';

/**
 * Workshop navigation tab.
 *
 * @slot - Tab label.
 * @slot icon - Optional leading icon.
 * @csspart tab - The interactive anchor.
 */
@customElement('ws-tab')
export class WsTab extends LitElement {
  static override styles = wsTabStyles;

  /** Link destination for the tab. */
  @property()
  href = '#';

  /** Whether this tab represents the current page or view. */
  @property({type: Boolean, reflect: true})
  selected = false;

  /** Accessible current-state token forwarded when selected. */
  @property({attribute: 'current-when-selected'})
  currentWhenSelected: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' =
    'page';

  override render() {
    return html`
      <a
        class="tab"
        part="tab"
        role="tab"
        href=${this.href}
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-current=${ifDefined(
          this.selected ? this.currentWhenSelected : undefined
        )}
      >
        <slot name="icon">${nothing}</slot>
        <slot></slot>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-tab': WsTab;
  }
}
