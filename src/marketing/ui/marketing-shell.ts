/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {AnchoredPanelController} from '../../internal/anchored-panel.js';
import {normalizeProduct, type MarketingProduct} from '../domain/product.js';
import {
  DEFAULT_PREVIEW_SETTINGS,
  type PreviewSettings,
} from '../domain/preview-settings.js';
import '../../site-footer.js';
import '../../app-shell/index.js';
import type {
  NavigationRequestEvent,
  AppShellThemeChangeEvent,
  AppShellNavigationMode,
} from '../../app-shell/index.js';
import './preview-controls.js';
import {styles} from './marketing-shell-styles.js';

/**
 * A marketing hub composed with the shared app shell: a connected or closed
 * drawer, product heading, preview settings behind a top app bar button,
 * screen catalog and shared copyright footer.
 *
 * @slot - The `mnw-screen-card` elements.
 * @slot empty - Shown when no cards are supplied.
 * @slot actions - Top app bar actions, after the preview settings button: icon buttons, buttons or any
 *   custom element, for example `<mnw-product-launcher>`.
 * @slot navigation - App-specific navigation; defaults to the screen catalog.
 * @slot extra - App-specific sections after the catalog, for example motion parts.
 * @fires settings-change - From the preview controls.
 */
@customElement('mnw-marketing-shell')
export class MaterialNextMarketingShell extends LitElement {
  static override styles = styles;

  /** The app the page presents. Required: nothing renders without it. */
  @property({attribute: false})
  product?: MarketingProduct;

  /** Current preview settings, shown by the preview controls. */
  @property({attribute: false})
  settings: PreviewSettings = DEFAULT_PREVIEW_SETTINGS;

  /** Settings that Reset returns to. */
  @property({attribute: false})
  defaults: PreviewSettings = DEFAULT_PREVIEW_SETTINGS;

  /** The app's palette names; empty hides the palette select. */
  @property({attribute: false})
  palettes: readonly string[] = [];

  /** Drawer policy: automatic modal/permanent, always closed until opened, or permanent. */
  @property({attribute: 'navigation-mode'})
  navigationMode: 'auto' | AppShellNavigationMode = 'modal';

  /** Shell width from which the automatic drawer is permanent. */
  @property({type: Number, attribute: 'permanent-from'}) permanentFrom = 900;

  /** Whether the preview settings panel is open. */
  @property({type: Boolean, reflect: true, attribute: 'settings-open'})
  settingsOpen = false;

  @query('.settings-trigger') private settingsTrigger?: HTMLElement;
  @query('.settings-popover') private settingsSurface?: HTMLElement;

  private readonly settingsPanel = new AnchoredPanelController(this, {
    isOpen: () => this.settingsOpen,
    setOpen: (open) => (this.settingsOpen = open),
    trigger: () => this.settingsTrigger,
    surface: () => this.settingsSurface,
    focus: () =>
      this.renderRoot.querySelector<HTMLElement>('mnw-preview-controls'),
  });

  private openCatalog(event: NavigationRequestEvent) {
    if (event.detail.href !== '#catalog') return;
    event.preventDefault();
    const catalog = this.renderRoot.querySelector<HTMLElement>('#catalog');
    catalog?.scrollIntoView({behavior: 'instant', block: 'start'});
    requestAnimationFrame(() => catalog?.focus({preventScroll: true}));
  }

  override render() {
    if (!this.product) return nothing;
    const p = normalizeProduct(this.product);
    return html`
      <mnw-app-shell
        heading=${p.name}
        .navigationMode=${this.navigationMode}
        .permanentFrom=${this.permanentFrom}
        @navigation-request=${this.openCatalog}
      >
        <a slot="brand" class="drawer-brand" href="./">
          ${p.icon ? html`<img src=${p.icon} alt="" width="32" height="32" />` : nothing}
          <span>${p.name}</span>
        </a>
        <div slot="actions" class="settings">
          <md-icon-button
            class="settings-trigger"
            aria-label="Preview settings"
            title="Preview settings"
            aria-haspopup="dialog"
            aria-expanded=${this.settingsOpen ? 'true' : 'false'}
            @click=${() => (this.settingsOpen = !this.settingsOpen)}
            ><md-icon>tune</md-icon></md-icon-button
          >
          <div
            class="settings-popover popover"
            .popover=${'manual'}
            ?data-open=${this.settingsOpen}
            @keydown=${this.settingsPanel.onKeyDown}
          >
            <section
              class="panel"
              role="dialog"
              aria-label="Preview settings"
              .inert=${!this.settingsOpen}
            >
              <mnw-preview-controls
                layout="stacked"
                tabindex="-1"
                .settings=${this.settings}
                .defaults=${this.defaults}
                .palettes=${this.palettes}
              ></mnw-preview-controls>
            </section>
          </div>
        </div>
        <slot slot="actions" name="actions"></slot>
        <slot slot="navigation" name="navigation">
          <mnw-navigation-item href="#catalog" icon="grid_view"
            >Screens</mnw-navigation-item
          >
        </slot>
        <mnw-app-shell-footer
          slot="navigation-footer"
          .theme=${this.settings.theme}
          privacy-href=${p.privacyUrl}
          code-of-conduct-href=${p.codeOfConductUrl}
          @theme-change=${(event: AppShellThemeChangeEvent) => {
            this.dispatchEvent(
              new CustomEvent('settings-change', {
                detail: {...this.settings, theme: event.detail.theme},
                bubbles: true,
                composed: true,
              })
            );
          }}
        ></mnw-app-shell-footer>
        <section id="catalog" tabindex="-1" aria-label="Screens">
          <div class="grid">
            <slot
              ><div class="empty">
                <slot name="empty">No screens available.</slot>
              </div></slot
            >
          </div>
        </section>

        <slot name="extra"></slot>

        <mnw-site-footer slot="footer"></mnw-site-footer>
      </mnw-app-shell>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-marketing-shell': MaterialNextMarketingShell;
  }
}
