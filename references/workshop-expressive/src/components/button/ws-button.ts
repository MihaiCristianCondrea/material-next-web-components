import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {wsButtonStyles} from './ws-button.styles.js';

export type WsButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost';
export type WsButtonSize = 'small' | 'medium' | 'large';

/**
 * Workshop button primitive.
 *
 * @slot - Button label content.
 * @slot icon - Optional leading icon content.
 * @csspart button - The native button element.
 */
@customElement('ws-button')
export class WsButton extends LitElement {
  static override styles = wsButtonStyles;

  /** Visual treatment matching the Workshop button variants. */
  @property({reflect: true})
  variant: WsButtonVariant = 'primary';

  /** Button density and height. */
  @property({reflect: true})
  size: WsButtonSize = 'medium';

  /** Disables interaction. */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /** Shows progress and temporarily disables interaction. */
  @property({type: Boolean, reflect: true})
  loading = false;

  /** Accessible label forwarded to the internal native button. */
  @property({attribute: 'aria-label'})
  accessibleLabel?: string;

  @state()
  private hasIcon = false;

  @state()
  private hasLabel = false;

  private readonly contentObserver = new MutationObserver(() => {
    this.syncSlottedState();
  });

  override connectedCallback() {
    super.connectedCallback();
    this.contentObserver.observe(this, {
      attributeFilter: ['slot'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    this.syncSlottedState();
  }

  override disconnectedCallback() {
    this.contentObserver.disconnect();
    super.disconnectedCallback();
  }

  override render() {
    const isUnavailable = this.disabled || this.loading;
    this.toggleAttribute('icon-only', this.hasIcon && !this.hasLabel);

    return html`
      <button
        class="button"
        part="button"
        type="button"
        ?disabled=${isUnavailable}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-label=${ifDefined(this.accessibleLabel)}
      >
        ${this.loading ? this.renderSpinner() : this.renderContent()}
      </button>
    `;
  }

  private renderContent() {
    return html`
      ${this.hasIcon
        ? html`<span class="icon"><slot name="icon"></slot></span>`
        : nothing}
      ${this.hasLabel
        ? html`<span class="label"><slot></slot></span>`
        : nothing}
    `;
  }

  private renderSpinner() {
    return html`<span class="spinner" aria-hidden="true"></span>`;
  }

  private syncSlottedState() {
    const hasIcon = this.querySelector('[slot="icon"]') !== null;
    const hasLabel = Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }

      return (node as Element).getAttribute('slot') !== 'icon';
    });

    if (this.hasIcon !== hasIcon) {
      this.hasIcon = hasIcon;
    }

    if (this.hasLabel !== hasLabel) {
      this.hasLabel = hasLabel;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-button': WsButton;
  }
}
