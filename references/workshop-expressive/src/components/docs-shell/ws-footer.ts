import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('ws-footer')
export class WsFooter extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: min(100% - 32px, 1120px);
      margin: 56px auto 24px;
      padding: 24px;
      border: 1px solid var(--ws-color-outline-variant, #e2e8f0);
      border-radius: var(--ws-shape-large, 12px);
      background: var(--ws-color-surface, #ffffff);
      box-shadow: var(--ws-elevation-sm, 0 1px 2px rgb(15 23 42 / 8%));
      font-family: var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif);
      color: var(--ws-color-on-surface-variant, #64748b);
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    @media (max-width: 820px) {
      .footer-inner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;

  override render() {
    return html`
      <div class="footer-inner">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-footer': WsFooter;
  }
}
