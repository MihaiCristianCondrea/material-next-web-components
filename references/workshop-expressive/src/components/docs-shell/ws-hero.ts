import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('ws-hero')
export class WsHero extends LitElement {
  @property() eyebrow = '';
  @property({attribute: 'hero-title'}) heroTitle = '';
  @property() description = '';

  static override styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      min-height: 220px;
      color: white;
      background: radial-gradient(
          circle at 78% 58%,
          rgb(168 85 247 / 68%) 0 2rem,
          transparent 8rem
        ),
        radial-gradient(
          circle at 72% 45%,
          rgb(14 165 233 / 50%) 0 1.5rem,
          transparent 7rem
        ),
        linear-gradient(130deg, #06b6d4 0%, #1237a7 48%, #5b21b6 100%);
      font-family: var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif);
    }

    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(
        rgb(255 255 255 / 24%) 1px,
        transparent 1px
      );
      background-size: 18px 18px;
      mask-image: linear-gradient(
        90deg,
        transparent 0 55%,
        black 75%,
        transparent 100%
      );
    }

    .shell {
      position: relative;
      z-index: 1;
      width: min(100% - 32px, 1120px);
      min-height: 220px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .content {
      display: grid;
      gap: 8px;
    }

    .eyebrow {
      font: var(
        --ws-typography-label-large,
        700 14px / 20px var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif)
      );
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.76;
    }

    h1 {
      margin: 0;
      max-width: 680px;
      font: var(
        --ws-typography-display-medium,
        800 44px / 52px var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif)
      );
      letter-spacing: -0.04em;
    }

    .subtitle {
      margin: 12px 0 0;
      max-width: 620px;
      font: var(
        --ws-typography-body-large,
        500 16px / 24px var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif)
      );
      opacity: 0.88;
    }

    @media (max-width: 820px) {
      .shell {
        flex-direction: column;
        justify-content: center;
        padding: 32px 0;
        align-items: flex-start;
      }
    }
  `;

  override render() {
    return html`
      <div class="shell">
        <slot name="mark"></slot>
        <div class="content">
          ${this.eyebrow ? html`<div class="eyebrow">${this.eyebrow}</div>` : ''}
          <h1>${this.heroTitle}</h1>
          ${this.description
            ? html`<div class="subtitle">${this.description}</div>`
            : ''}
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-hero': WsHero;
  }
}
