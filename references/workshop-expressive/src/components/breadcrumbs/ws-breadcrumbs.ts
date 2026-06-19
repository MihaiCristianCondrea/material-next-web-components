import {LitElement, html, nothing} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {customElement, property, state} from 'lit/decorators.js';

import {wsBreadcrumbsStyles} from './ws-breadcrumbs.styles.js';

export interface WsCrumb {
  id: string;
  label: string;
  href?: string;
}

/**
 * Workshop breadcrumb navigation.
 *
 * @csspart nav - The breadcrumb navigation element.
 * @csspart crumb - Each breadcrumb label/link.
 * @csspart separator - The separator icon between crumbs.
 */
@customElement('ws-breadcrumbs')
export class WsBreadcrumbs extends LitElement {
  static override styles = wsBreadcrumbsStyles;

  /** Crumbs to render. Use the `crumbs` attribute with JSON or set this property. */
  @property({attribute: false})
  crumbs: WsCrumb[] = [];

  @state()
  private activeCrumbId?: string;

  static override get observedAttributes() {
    return [...super.observedAttributes, 'crumbs'];
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    value: string | null
  ) {
    super.attributeChangedCallback(name, oldValue, value);

    if (name === 'crumbs' && oldValue !== value) {
      this.crumbs = this.parseCrumbsAttribute(value);
    }
  }

  override render() {
    if (this.crumbs.length === 0) {
      return nothing;
    }

    return html`
      <nav class="breadcrumbs" part="nav" aria-label="Breadcrumb">
        ${this.crumbs.map((crumb, index) => this.renderCrumb(crumb, index))}
      </nav>
    `;
  }

  private parseCrumbsAttribute(value: string | null): WsCrumb[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          (crumb): crumb is Record<string, unknown> =>
            Boolean(crumb) && typeof crumb === 'object'
        )
        .filter(
          (crumb) =>
            typeof crumb.id === 'string' &&
            typeof crumb.label === 'string' &&
            (crumb.href === undefined || typeof crumb.href === 'string')
        )
        .map((crumb) => ({
          id: crumb.id as string,
          label: crumb.label as string,
          href: crumb.href as string | undefined,
        }));
    } catch {
      return [];
    }
  }

  private renderCrumb(crumb: WsCrumb, index: number) {
    const isLast = index === this.crumbs.length - 1;
    const label = crumb.label;
    const isActive = this.activeCrumbId === crumb.id;
    const classes = `crumb${isActive ? ' active' : ''}`;
    const crumbTemplate = isLast
      ? html`<span class=${classes} part="crumb" aria-current="page"
          >${label}</span
        >`
      : html`<a
          class=${classes}
          part="crumb"
          href=${crumb.href ?? '#'}
          aria-current=${ifDefined(isActive ? 'location' : undefined)}
          @click=${(event: MouseEvent) => this.activateCrumb(crumb, event)}
          >${label}</a
        >`;

    return html`
      ${crumbTemplate} ${isLast ? nothing : this.renderSeparator()}
    `;
  }

  private activateCrumb(crumb: WsCrumb, event: MouseEvent) {
    if (!crumb.href || crumb.href === '#') {
      event.preventDefault();
    }

    this.activeCrumbId = crumb.id;
    this.dispatchEvent(
      new CustomEvent('ws-breadcrumb-click', {
        detail: {crumb},
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderSeparator() {
    return html`
      <svg
        class="separator"
        part="separator"
        viewBox="0 0 24 24"
        focusable="false"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="m13.172 12-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
        ></path>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ws-breadcrumbs': WsBreadcrumbs;
  }
}
