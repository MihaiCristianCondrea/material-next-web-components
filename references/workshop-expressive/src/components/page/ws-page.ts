import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {wsPageStyles} from './ws-page.styles.js';

@customElement('ws-page')
export class WsPage extends LitElement {
  static override styles = wsPageStyles;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-page': WsPage;
  }
}
