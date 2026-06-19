import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import {wsBrandMarkStyles} from './ws-brand-mark.styles.js';

/**
 * Parameterized Workshop brand lockup.
 *
 * @slot mark - Optional custom mark content. Defaults to `mark-text`.
 * @slot - Optional custom title/subtitle content.
 * @csspart mark - The gradient mark container.
 * @csspart title - The title text.
 * @csspart subtitle - The subtitle text.
 */
@customElement('ws-brand-mark')
export class WsBrandMark extends LitElement {
  static override styles = wsBrandMarkStyles;

  /** Text rendered inside the gradient mark when the mark slot is empty. */
  @property({attribute: 'mark-text'})
  markText = 'W';

  /** Brand title text. */
  @property()
  override title = 'Workshop';

  /** Optional subtitle text. */
  @property()
  subtitle = '';

  /** Square mark size as a CSS length. */
  @property()
  size = '48px';

  /** Hide the title/subtitle lockup and render only the mark. */
  @property({type: Boolean, attribute: 'mark-only', reflect: true})
  markOnly = false;

  /** Comma-separated CSS colors used for the mark gradient. */
  @property({attribute: 'gradient-colors'})
  gradientColors = '';

  override render() {
    const hostStyles = {
      '--ws-brand-mark-size': this.size,
      ...(this.gradientColors
        ? {'--ws-brand-mark-gradient': this.gradientValue}
        : {}),
    };

    return html`
      <div class="root" style=${styleMap(hostStyles)}>
        <span class="mark" part="mark" aria-hidden="true">
          <slot name="mark">${this.renderDefaultMark()}</slot>
        </span>
        ${this.markOnly
          ? nothing
          : html`<span class="text">
              <slot>
                <span class="title" part="title">${this.title}</span>
                ${this.subtitle
                  ? html`<span class="subtitle" part="subtitle"
                      >${this.subtitle}</span
                    >`
                  : nothing}
              </slot>
            </span>`}
      </div>
    `;
  }

  /** Restarts the SVG motion timeline, useful when the mark is activated. */
  restartAnimation() {
    this.toggleAttribute('animating', false);
    // Force style recalculation so repeated clicks restart the CSS timeline.
    this.getBoundingClientRect();
    this.toggleAttribute('animating', true);
  }

  private renderDefaultMark() {
    if (this.markText !== 'W') {
      return this.markText;
    }

    return html`
      <svg
        class="logo"
        viewBox="0 0 100 100"
        focusable="false"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="wGrad"
            x1="18"
            y1="25"
            x2="82"
            y2="76"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#AA42FF"></stop>
            <stop offset="50%" stop-color="#7066F5"></stop>
            <stop offset="100%" stop-color="#4B3BFF"></stop>
          </linearGradient>
          <linearGradient id="wGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#AA42FF"></stop>
            <stop offset="100%" stop-color="#7066F5"></stop>
          </linearGradient>
          <linearGradient id="wGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7066F5"></stop>
            <stop offset="100%" stop-color="#4B3BFF"></stop>
          </linearGradient>
          <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF94A5"></stop>
            <stop offset="100%" stop-color="#DE7283"></stop>
          </linearGradient>
        </defs>
        <circle
          class="drop drop-1"
          cx="50"
          cy="45"
          r="2.5"
          fill="url(#dotGrad)"
        ></circle>
        <circle
          class="drop drop-2"
          cx="50"
          cy="45"
          r="3"
          fill="url(#wGradRight)"
        ></circle>
        <circle
          class="drop drop-3"
          cx="50"
          cy="45"
          r="2"
          fill="url(#dotGrad)"
        ></circle>
        <circle
          class="drop drop-4"
          cx="50"
          cy="45"
          r="3.5"
          fill="url(#wGradLeft)"
        ></circle>
        <circle
          class="drop drop-5"
          cx="50"
          cy="45"
          r="2"
          fill="url(#wGradLeft)"
        ></circle>
        <circle
          class="drop drop-6"
          cx="50"
          cy="45"
          r="2.5"
          fill="url(#dotGrad)"
        ></circle>
        <path
          class="w-half"
          d="M 50 55 L 34 76 L 18 25"
          fill="none"
          stroke="url(#wGrad)"
          stroke-width="20"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <path
          class="w-half"
          d="M 50 55 L 66 76 L 82 25"
          fill="none"
          stroke="url(#wGrad)"
          stroke-width="20"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
        <circle
          class="dot"
          cx="50"
          cy="28"
          r="10"
          fill="url(#dotGrad)"
        ></circle>
      </svg>
    `;
  }

  private get gradientValue() {
    const colors = this.gradientColors
      .split(',')
      .map((color) => color.trim())
      .filter(Boolean);

    if (colors.length < 2) {
      return undefined;
    }

    return `linear-gradient(135deg, ${colors.join(', ')})`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-brand-mark': WsBrandMark;
  }
}
