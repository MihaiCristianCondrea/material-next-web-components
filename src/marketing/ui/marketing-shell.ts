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
import './marketing-top-app-bar.js';
import './preview-controls.js';
import {styles} from './marketing-shell-styles.js';

export const ALL_CATEGORIES = '';

/** Google's badge guidelines ask for this line wherever the badge appears. */
export const PLAY_TRADEMARK =
  'Google Play and the Google Play logo are trademarks of Google LLC.';

export type CategoryChangeEvent = CustomEvent<{category: string}>;

/**
 * A complete marketing hub page around the app's screen cards: the top app
 * bar, the preview settings, a category filter and the footer with the credits and
 * Google Play's trademark line.
 *
 * @slot - The `mnw-screen-card` elements.
 * @slot empty - Shown when no card matches the filter.
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
      <a class="skip" href="#catalog">Skip to screens</a>
      <mnw-marketing-top-app-bar
        name=${p.name}
        icon=${p.icon}
        context="UI kit"
      ></mnw-marketing-top-app-bar>
      <div class="controls">
        <mnw-preview-controls
          .settings=${this.settings}
          .defaults=${this.defaults}
          .palettes=${this.palettes}
        ></mnw-preview-controls>
      </div>

      <main id="catalog" tabindex="-1" aria-labelledby="catalog-title">
        <div class="catalog-header">
          <h1 id="catalog-title">
            ${this.catalogTitle} <span class="count">${this.count}</span>
          </h1>
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
      </main>

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
