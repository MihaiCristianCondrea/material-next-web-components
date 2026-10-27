/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/focus/md-focus-ring.js';
import {LitElement, html, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';
import {
  DEFAULT_SOURCE_COLOR,
  hctFromHex,
  hexFromHct,
  normalizeHex,
  type HctChannel,
  type HctColor,
} from '../domain/color-theme.js';
import './hct-slider.js';
import type {MaterialNextHctSlider} from './hct-slider.js';
import {styles} from './color-picker-styles.js';

/**
 * A color picker in Material's HCT space: a hex swatch that opens the
 * system color dialog, and hue, chroma and tone sliders. Reusable on its own,
 * for example to choose an app's seed color.
 *
 * @fires input - While the color changes; read `value`.
 * @fires change - When a change is committed (a slider let go, the dialog closed).
 * @csspart swatch - The round swatch.
 * @csspart sliders - The surface around the three sliders.
 */
@customElement('mnw-color-picker')
export class MaterialNextColorPicker extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = styles;

  /** The color, as `#rrggbb`. */
  @property() value = DEFAULT_SOURCE_COLOR;

  /** Label of the swatch row. */
  @property({attribute: 'swatch-label'}) swatchLabel = 'Source color';

  /**
   * HCT as the sliders set it. Kept apart from `value` so that, for example,
   * chroma 0 keeps the hue the visitor chose instead of snapping to red.
   */
  @state() private hct: HctColor = hctFromHex(DEFAULT_SOURCE_COLOR);

  /** The value the sliders last produced, to tell it from a new one. */
  private fromSliders = '';

  private emit(type: 'input' | 'change') {
    this.dispatchEvent(new Event(type, {bubbles: true, composed: true}));
  }

  private onSlider(e: Event) {
    const slider = e.target as MaterialNextHctSlider;
    const channel = slider.channel as HctChannel;
    this.hct = {...this.hct, [channel]: slider.value};
    this.value = this.fromSliders = hexFromHct(this.hct);
    this.emit(e.type as 'input' | 'change');
  }

  private onSwatch(e: Event) {
    // The native input's own events are not composed; this element's are.
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    const hex = normalizeHex(input.value);
    if (!hex) return;
    this.value = hex;
    this.emit(e.type as 'input' | 'change');
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('value')) return;
    const hex = normalizeHex(this.value);
    if (!hex) {
      // Not a color: keep showing the last one.
      this.value = (changed.get('value') as string) ?? DEFAULT_SOURCE_COLOR;
      return;
    }
    if (hex !== this.value) this.value = hex;
    if (hex !== this.fromSliders) this.hct = hctFromHex(hex);
  }

  override render() {
    const slider = (channel: HctChannel, label: string) =>
      html`<mnw-hct-slider
        channel=${channel}
        label=${label}
        .value=${this.hct[channel]}
        .color=${this.value}
        @input=${this.onSlider}
        @change=${this.onSlider}
      ></mnw-hct-slider>`;
    return html`<label class="swatch-row" for="swatch">
        <span class="swatch-label">${this.swatchLabel}</span>
        <span class="hex" aria-hidden="true">${this.value}</span>
        <span class="swatch" part="swatch" style="--_swatch: ${this.value}">
          <input
            id="swatch"
            type="color"
            .value=${live(this.value)}
            @input=${this.onSwatch}
            @change=${this.onSwatch}
          />
          <md-focus-ring for="swatch"></md-focus-ring>
        </span>
      </label>
      <div class="sliders" part="sliders">
        ${slider('hue', 'Hue')} ${slider('chroma', 'Chroma')}
        ${slider('tone', 'Tone')}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-color-picker': MaterialNextColorPicker;
  }
}
