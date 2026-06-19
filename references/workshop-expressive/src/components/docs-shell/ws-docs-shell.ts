import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('ws-docs-shell')
export class WsDocsShell extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif);
      background: var(--ws-color-background, #f8fafc);
    }

    #main-wrapper {
      flex-grow: 1;
    }

    ::slotted([slot='nav']) {
      position: sticky;
      top: 0;
      z-index: 5;
    }
  `;

  override render() {
    return html`
      <slot name="nav"></slot>
      <slot name="hero"></slot>
      <div id="main-wrapper">
        <slot></slot>
      </div>
      <slot name="footer"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-docs-shell': WsDocsShell;
  }
}
