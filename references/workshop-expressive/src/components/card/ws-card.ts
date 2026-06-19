import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {wsCardStyles} from './ws-card.styles.js';

@customElement('ws-card')
export class WsCard extends LitElement {
  static override styles = wsCardStyles;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-card': WsCard;
  }
}
