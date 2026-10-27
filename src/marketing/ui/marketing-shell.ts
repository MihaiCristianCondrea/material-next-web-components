/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {normalizeProduct, type MarketingProduct} from '../domain/product.js';
import {
  DEFAULT_PREVIEW_SETTINGS,
  type PreviewSettings,
} from '../domain/preview-settings.js';
import {chips} from './controls.js';
import '../../app-shell/index.js';
import type {
  NavigationRequestEvent,
  AppShellThemeChangeEvent,
  AppShellNavigationMode,
} from '../../app-shell/index.js';
import './preview-controls.js';
import {styles} from './marketing-shell-styles.js';

export const ALL_CATEGORIES = '';

/** Google's badge guidelines ask for this line wherever the badge appears. */
export const PLAY_TRADEMARK =
  'Google Play and the Google Play logo are trademarks of Google LLC.';

export type CategoryChangeEvent = CustomEvent<{category: string}>;

/**
 * A marketing hub composed with the shared app shell: a connected or closed
 * drawer, product heading, preview settings, screen catalog and product footer.
 *
 * @slot - The `mnw-screen-card` elements.
 * @slot empty - Shown when no card matches the filter.
 * @slot navigation - App-specific navigation; defaults to the screen catalog.
 * @slot extra - App-specific sections after the catalog, for example motion parts.
 * @fires settings-change - From the preview controls.
 * @fires category-change - `{category}`; "" is every category.
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

  /** Catalog filter chips, as `{id, label}`; shown with two or more. */
  @property({attribute: false})
  categories: ReadonlyArray<{id: string; label: string}> = [];

  /** Selected category id; `""` is All. */
  @property()
  category = ALL_CATEGORIES;

  /** Cards shown under the current filter. */
  @property({type: Number})
  count = 0;

  /** Heading of the catalog section. */
  @property({attribute: 'catalog-title'})
  catalogTitle = 'Screens';

  /** Drawer policy: automatic modal/permanent, always closed until opened, or permanent. */
  @property({attribute: 'navigation-mode'})
  navigationMode: 'auto' | AppShellNavigationMode = 'modal';

  /** Shell width from which the automatic drawer is permanent. */
  @property({type: Number, attribute: 'permanent-from'}) permanentFrom = 900;

  private openCatalog(event: NavigationRequestEvent) {
    if (event.detail.href !== '#catalog') return;
    event.preventDefault();
    const catalog = this.renderRoot.querySelector<HTMLElement>('#catalog');
    catalog?.scrollIntoView({behavior: 'instant', block: 'start'});
    requestAnimationFrame(() => catalog?.focus({preventScroll: true}));
  }

  private pickCategory(category: string) {
    this.dispatchEvent(
      new CustomEvent('category-change', {
        detail: {category},
        bubbles: true,
        composed: true,
      })
    );
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
        <slot slot="navigation" name="navigation">
          <mnw-navigation-item href="#catalog" icon="grid_view"
            >${this.catalogTitle}</mnw-navigation-item
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
        <div class="controls">
          <mnw-preview-controls
            .settings=${this.settings}
            .defaults=${this.defaults}
            .palettes=${this.palettes}
          ></mnw-preview-controls>
        </div>

        <section id="catalog" tabindex="-1" aria-labelledby="catalog-title">
          <div class="catalog-header">
            <h2 id="catalog-title">
              ${this.catalogTitle} <span class="count">${this.count}</span>
            </h2>
            ${
              this.categories.length > 1
                ? chips(
                    [
                      [ALL_CATEGORIES, 'All'] as const,
                      ...this.categories.map((c) => [c.id, c.label] as const),
                    ],
                    this.category,
                    (c) => this.pickCategory(c),
                    'Filter screens'
                  )
                : nothing
            }
          </div>
          ${
            this.count
              ? html`<div class="grid"><slot></slot></div>`
              : html`<div class="empty">
                  <slot name="empty">No screens in this category yet.</slot>
                </div>`
          }
        </section>

        <slot name="extra"></slot>

        <footer>
          <div class="footer__meta">
            <span class="footer__product"
              >${p.name}${p.version ? html` · ${p.version}` : nothing}</span
            >
            ${p.credit ? html`<span>${p.credit}</span>` : nothing}
          </div>
          <nav class="footer__links" aria-label="Links">
            ${
              p.storeUrl
                ? html`<a href=${p.storeUrl} target="_blank" rel="noopener"
                    ><md-icon>shop</md-icon>Google Play</a
                  >`
                : nothing
            }
            ${
              p.repositoryUrl
                ? html`<a href=${p.repositoryUrl} target="_blank" rel="noopener"
                    ><md-icon>code</md-icon>Source</a
                  >`
                : nothing
            }
            ${p.links.map(
              (l) =>
                html`<a href=${l.href} target="_blank" rel="noopener"
                  >${l.icon ? html`<md-icon>${l.icon}</md-icon>` : nothing}${l.label}</a
                >`
            )}
          </nav>
          ${
            p.storeUrl
              ? html`<span class="trademark">${PLAY_TRADEMARK}</span>`
              : nothing
          }
        </footer>
      </mnw-app-shell>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-marketing-shell': MaterialNextMarketingShell;
  }
  interface HTMLElementEventMap {
    'category-change': CategoryChangeEvent;
  }
}
