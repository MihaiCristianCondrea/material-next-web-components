import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {wsSwitchStyles} from './ws-switch.styles.js';

/**
 * Workshop switch primitive for binary settings.
 *
 * @fires change - Dispatched when the checked state changes.
 * @slot checked-icon - Icon shown when the switch is checked.
 * @slot unchecked-icon - Icon shown when the switch is unchecked.
 * @csspart button - The internal switch button.
 * @csspart track - The switch track.
 * @csspart handle - The switch handle.
 */
@customElement('ws-switch')
export class WsSwitch extends LitElement {
  static override styles = wsSwitchStyles;

  /** Whether the switch is on. */
  @property({type: Boolean, reflect: true})
  checked = false;

  /** Disables interaction. */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /** Accessible label forwarded to the internal switch button. */
  @property({attribute: 'aria-label'})
  accessibleLabel?: string;

  override render() {
    return html`
      <button
        class="switch"
        part="button"
        type="button"
        role="switch"
        aria-checked=${this.checked ? 'true' : 'false'}
        aria-label=${ifDefined(this.accessibleLabel)}
        ?disabled=${this.disabled}
        @click=${this.toggleChecked}
      >
        <span class="track" part="track" aria-hidden="true">
          <span class="handle" part="handle">
            <span class="unchecked-icon"
              ><slot name="unchecked-icon"></slot
            ></span>
            <span class="checked-icon"><slot name="checked-icon"></slot></span>
          </span>
        </span>
      </button>
    `;
  }

  private toggleChecked() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-switch': WsSwitch;
  }
}
