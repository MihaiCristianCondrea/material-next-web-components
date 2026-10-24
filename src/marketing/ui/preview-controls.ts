/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/switch/switch.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  CAPTURED_PALETTE,
  DEFAULT_PREVIEW_SETTINGS,
  paletteLabel,
  settingsEqual,
  type PreviewSettings,
} from '../domain/preview-settings.js';
import {NAV_OPTIONS, THEME_OPTIONS} from './options.js';
import {segments, select} from './controls.js';
import {styles} from './preview-controls-styles.js';

export type SettingsChangeEvent = CustomEvent<PreviewSettings>;

/**
 * The hub-wide preview settings: theme, system navigation, palette and the
 * device frame, with a reset once anything differs from the defaults.
 *
 * @fires settings-change - The new settings, as `detail`.
 */
@customElement('mnw-preview-controls')
export class MaterialNextPreviewControls extends LitElement {
  static override styles = styles;

  @property({attribute: false})
  settings: PreviewSettings = DEFAULT_PREVIEW_SETTINGS;

  @property({attribute: false})
  defaults: PreviewSettings = DEFAULT_PREVIEW_SETTINGS;

  /** The app's palette names; "As captured" is always offered first. */
  @property({attribute: false})
  palettes: readonly string[] = [];

  private change(patch: Partial<PreviewSettings>) {
    this.dispatchEvent(
      new CustomEvent<PreviewSettings>('settings-change', {
        detail: {...this.settings, ...patch},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const s = this.settings;
    const palettes = [
      CAPTURED_PALETTE,
      ...this.palettes.filter((p) => p !== CAPTURED_PALETTE),
    ];
    return html`<div class="bar" role="toolbar" aria-label="Preview settings">
      <div class="group">
        <span class="label">Theme</span>
        ${segments(THEME_OPTIONS, s.theme, (theme) => this.change({theme}), 'Preview theme')}
      </div>
      <div class="group">
        <span class="label">Navigation</span>
        ${segments(NAV_OPTIONS, s.navType, (navType) => this.change({navType}), 'System navigation')}
      </div>
      ${
        this.palettes.length
          ? html`<div class="group">
              <span class="label">Palette</span>
              ${select(
              'Palette',
              palettes.map((p) => [p, paletteLabel(p)] as const),
              s.palette,
              (palette) => this.change({palette})
            )}
            </div>`
          : nothing
      }
      <div class="group">
        <span class="label">Device frame</span>
        <div class="switch">
          <md-switch
            aria-label="Device frame"
            .selected=${s.deviceFrame}
            @change=${(e: Event) =>
              this.change({
                deviceFrame: (
                  e.target as HTMLInputElement & {selected: boolean}
                ).selected,
              })}
          ></md-switch>
        </div>
      </div>
      ${
        settingsEqual(s, this.defaults)
          ? nothing
          : html`<md-text-button
              class="reset"
              @click=${() => this.change(this.defaults)}
            >
              <md-icon slot="icon">restart_alt</md-icon>Reset
            </md-text-button>`
      }
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-preview-controls': MaterialNextPreviewControls;
  }
  interface HTMLElementEventMap {
    'settings-change': SettingsChangeEvent;
  }
}
