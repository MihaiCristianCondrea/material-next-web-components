/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/slider/slider.js';
import type {MdSlider} from '@material/web/slider/slider.js';
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {
  HCT_RANGES,
  hctFromHex,
  hexFromHct,
  type HctChannel,
} from '../domain/color-theme.js';
import {styles} from './hct-slider-styles.js';

const STOPS = 24;

/**
 * One HCT channel (hue, chroma or tone) as a labelled Material slider over a
 * gradient of the colors it reaches from `color`.
 *
 * @fires input - While the value changes.
 * @fires change - When the visitor lets go.
 */
@customElement('mnw-hct-slider')
export class MaterialNextHctSlider extends LitElement {
  static override styles = styles;

  /** Which channel the slider sets. */
  @property() channel: HctChannel = 'hue';

  /** Visible and accessible label. */
  @property() label = '';

  /** The channel's value: hue 0 to 360, chroma 0 to 150, tone 0 to 100. */
  @property({type: Number}) value = 0;

  /** The current color, as hex; the gradient varies only this channel. */
  @property() color = '';

  /** The gradient as `linear-gradient()`, varying only this channel. */
  get gradient() {
    const base = hctFromHex(this.color || '#808080');
    // A readable middle for the hue strip, whatever the current color.
    const from =
      this.channel === 'hue' ? {hue: 0, chroma: 100, tone: 50} : base;
    const max = HCT_RANGES[this.channel];
    const stops = Array.from({length: STOPS + 1}, (_, i) => {
      const hex = hexFromHct({...from, [this.channel]: (max * i) / STOPS});
      return `${hex} ${((100 * i) / STOPS).toFixed(1)}%`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }

  private relay(e: Event) {
    this.value = (e.target as MdSlider).value ?? 0;
    // One event from this element, not md-slider's composed one as well.
    e.stopPropagation();
    this.dispatchEvent(new Event(e.type, {bubbles: true, composed: true}));
  }

  override render() {
    return html`<label class="label" for="slider">${this.label}</label>
      <md-slider
        id="slider"
        labeled
        aria-label=${this.label}
        .min=${0}
        .max=${HCT_RANGES[this.channel]}
        .value=${Math.round(this.value)}
        .valueLabel=${String(Math.round(this.value))}
        @input=${this.relay}
        @change=${this.relay}
      ></md-slider>
      <div
        class="gradient"
        part="gradient"
        aria-hidden="true"
        style=${styleMap({background: this.gradient})}
      ></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-hct-slider': MaterialNextHctSlider;
  }
}
