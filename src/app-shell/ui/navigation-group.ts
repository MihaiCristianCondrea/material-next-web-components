/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */
import '@material/web/icon/icon.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/ripple/ripple.js';
import {LitElement, html, type PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {styles} from './navigation-group-styles.js';

/**
 * An expandable category in an app shell drawer. Destinations stay mounted
 * while collapsed. A newly active destination opens its category.
 * @slot - Navigation items, or nested navigation groups.
 * @slot icon - A custom category icon, overriding `icon`.
 * @fires navigation-group-toggle - `{open}` after the visitor toggles the category.
 * @csspart toggle - The category button.
 */
@customElement('mnw-navigation-group')
export class MaterialNextNavigationGroup extends LitElement {
  static override styles = styles;
  /** Category name. */
  @property() label = '';
  /** Material Symbols name. */
  @property() icon = '';
  /** Whether destinations are expanded. */
  @property({type: Boolean, reflect: true}) open = false;
  @state() private hasActive = false;
  @query('button') private toggleButton?: HTMLButtonElement;
  private observer?: MutationObserver;

  override connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver((records) => {
      this.updateActive();
      if (
        records.some(
          (record) =>
            record.target instanceof Element &&
            record.target.hasAttribute('active')
        )
      )
        this.open = true;
    });
    this.observer.observe(this, {
      subtree: true,
      attributes: true,
      attributeFilter: ['active'],
    });
  }
  override disconnectedCallback() {
    this.observer?.disconnect();
    super.disconnectedCallback();
  }
  private updateActive() {
    this.hasActive = !!this.querySelector('mnw-navigation-item[active]');
  }
  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('open') && !this.open) {
      const root = this.getRootNode() as Document | ShadowRoot;
      if (
        root.activeElement &&
        this.contains(root.activeElement) &&
        root.activeElement !== this
      )
        this.toggleButton?.focus();
    }
  }
  override render() {
    return html` <button
        part="toggle"
        class=${this.hasActive ? 'current' : ''}
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="destinations"
        @click=${() => {
          this.open = !this.open;
          this.dispatchEvent(
            new CustomEvent('navigation-group-toggle', {
              detail: {open: this.open},
              bubbles: true,
              composed: true,
            })
          );
        }}
      >
        <md-ripple></md-ripple><md-focus-ring></md-focus-ring>
        <span class="icon"
          ><slot name="icon"
            ><md-icon aria-hidden="true">${this.icon}</md-icon></slot
          ></span
        >
        <span class="label">${this.label}</span>
        <md-icon class="chevron" aria-hidden="true">expand_more</md-icon>
      </button>
      <div
        id="destinations"
        class="children"
        role="group"
        aria-label=${this.label}
        aria-hidden=${this.open ? 'false' : 'true'}
        .inert=${!this.open}
      >
        <div class="clip">
          <slot
            @slotchange=${() => {
              this.updateActive();
              if (this.hasActive) this.open = true;
            }}
          ></slot>
        </div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-navigation-group': MaterialNextNavigationGroup;
  }
}
