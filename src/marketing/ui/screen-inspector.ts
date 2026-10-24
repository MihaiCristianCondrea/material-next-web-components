/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/switch/switch.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  DEFAULT_PROTOTYPE_VIEW,
  type CompareAxis,
  type PrototypeMode,
  type PrototypeView,
} from '../data/prototype-url.js';
import {CAPTURED_PALETTE, paletteLabel} from '../domain/preview-settings.js';
import type {MarketingScreen, ScreenState} from '../domain/screen.js';
import {chips, controlPanel, segments, select} from './controls.js';
import {NAV_OPTIONS, THEME_OPTIONS, WINDOW_OPTIONS} from './options.js';
import {styles} from './screen-inspector-styles.js';

const MODE_OPTIONS = [
  ['inspect', 'Inspect', 'search'],
  ['compare', 'Compare', 'compare'],
] as const;

const COMPARE_OPTIONS = [
  ['theme', 'Light and dark'],
  ['nav', 'Navigation'],
  ['palette', 'Palettes'],
  ['frame', 'Frame'],
] as const;

type Switchable = HTMLElement & {selected: boolean};

/**
 * The prototype page's side panel: the screen's details, the view options and
 * the screen's own controls and presets.
 *
 * @fires view-change - `Partial<PrototypeView>` to apply.
 * @fires screen-select - `{id}` of the screen to open.
 * @fires state-patch - `{patch}` for the screen's state.
 * @fires state-reset - Back to the screen's defaults.
 */
@customElement('mnw-screen-inspector')
export class MaterialNextScreenInspector extends LitElement {
  static override styles = styles;

  @property({attribute: false})
  screen?: MarketingScreen;

  @property({attribute: false})
  screens: readonly MarketingScreen[] = [];

  @property({attribute: false})
  view: PrototypeView = DEFAULT_PROTOTYPE_VIEW;

  @property({attribute: false})
  palettes: readonly string[] = [];

  /** The live screen's state, for the controls' current values. */
  @property({attribute: false})
  state: ScreenState = {};

  @property({attribute: 'gallery-href'})
  galleryHref = './';

  /** Opens the bare screen for captures. */
  @property({attribute: 'capture-href'})
  captureHref = '';

  /** Offer the ad stand-ins switch (apps with ads only). */
  @property({type: Boolean, attribute: 'ads-toggle'})
  adsToggle = false;

  private emit(name: string, detail: unknown) {
    this.dispatchEvent(
      new CustomEvent(name, {detail, bubbles: true, composed: true})
    );
  }

  private view$(patch: Partial<PrototypeView>) {
    this.emit('view-change', patch);
  }

  private paletteSelect(
    label: string,
    value: string,
    key: 'palette' | 'paletteB'
  ) {
    const palettes = [
      CAPTURED_PALETTE,
      ...this.palettes.filter((p) => p !== CAPTURED_PALETTE),
    ];
    return select(
      label,
      palettes.map((p) => [p, paletteLabel(p)] as const),
      value,
      (p) => this.view$({[key]: p})
    );
  }

  override render() {
    const s = this.screen;
    if (!s) return nothing;
    const v = this.view;
    return html`
      <md-outlined-button class="back" href=${this.galleryHref}>
        <md-icon slot="icon">arrow_back</md-icon>All screens
      </md-outlined-button>

      <div class="meta">
        ${
          s.categoryLabel || s.category
            ? html`<span class="tag">${s.categoryLabel ?? s.category}</span>`
            : nothing
        }
        <h1>${s.title}</h1>
        <p>${s.description}</p>
        ${s.source ? html`<code>${s.source}</code>` : nothing}
      </div>

      <div class="section">
        <span class="label">Screen</span>
        ${select(
          'Screen',
          this.screens.map((x) => [x.id, x.title] as const),
          s.id,
          (id) => this.emit('screen-select', {id})
        )}
      </div>

      <div class="section">
        <span class="label">View</span>
        ${segments(MODE_OPTIONS, v.mode, (mode: PrototypeMode) => this.view$({mode}), 'View mode')}
      </div>

      ${v.mode === 'compare' ? this.renderCompare(v) : this.renderInspect(v, s)}

      <div class="section actions">
        ${
          v.mode === 'inspect'
            ? html`<md-outlined-button
                @click=${() => this.emit('state-reset', null)}
              >
                <md-icon slot="icon">restart_alt</md-icon>Reset state
              </md-outlined-button>`
            : nothing
        }
        ${
          this.captureHref
            ? html`<md-text-button href=${this.captureHref} target="_blank">
                <md-icon slot="icon">photo_camera</md-icon>Capture view
              </md-text-button>`
            : nothing
        }
      </div>
    `;
  }

  private renderCompare(v: PrototypeView) {
    return html`<div class="section">
      <span class="label">Compare</span>
      ${chips(COMPARE_OPTIONS, v.compare, (compare: CompareAxis) => this.view$({compare}), 'Compare')}
      ${
        v.compare === 'palette'
          ? html`<span class="label">Palette A</span>
              ${this.paletteSelect('Palette A', v.palette, 'palette')}
              <span class="label">Palette B</span>
              ${this.paletteSelect('Palette B', v.paletteB, 'paletteB')}`
          : nothing
      }
    </div>`;
  }

  private renderInspect(v: PrototypeView, s: MarketingScreen) {
    return html`
      <div class="section">
        <span class="label">Theme</span>
        ${segments(THEME_OPTIONS, v.theme, (theme) => this.view$({theme}), 'Preview theme')}
        <span class="label">System navigation</span>
        ${segments(NAV_OPTIONS, v.navType, (navType) => this.view$({navType}), 'System navigation')}
        <span class="label">Window</span>
        ${segments(WINDOW_OPTIONS, v.window, (window) => this.view$({window}), 'Window size')}
      </div>
      <div class="section">
        ${
          this.palettes.length
            ? html`<span class="label">Palette</span
                >${this.paletteSelect('Palette', v.palette, 'palette')}`
            : nothing
        }
        <label class="switch-row">
          <md-switch
            .selected=${v.deviceFrame}
            @change=${(e: Event) => this.view$({deviceFrame: (e.target as Switchable).selected})}
          ></md-switch>
          Device frame
        </label>
        ${
          this.adsToggle
            ? html`<label class="switch-row">
                <md-switch
                  .selected=${v.showAds}
                  @change=${(e: Event) => this.view$({showAds: (e.target as Switchable).selected})}
                ></md-switch>
                Show ads
              </label>`
            : nothing
        }
      </div>
      ${
        s.controls?.length
          ? html`<div class="section">
              ${controlPanel(s.controls, this.state, (patch) => this.emit('state-patch', {patch}))}
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-screen-inspector': MaterialNextScreenInspector;
  }
}
