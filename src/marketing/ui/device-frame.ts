/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {DeviceName} from '../domain/windows.js';
import {marketingAsset} from './assets.js';
import {styles} from './device-frame-styles.js';

/**
 * Google's device art around a slotted app screen: the Pixel 9 Pro XL for
 * phones, the Pixel 9 Pro Fold open for tablets, the Pixelbook Go for desktop
 * windows. The slotted screen stays in light DOM, so the app's CSS applies.
 *
 * @slot - The app screen, sized to the device's window.
 */
@customElement('mnw-device-frame')
export class MaterialNextDeviceFrame extends LitElement {
  static override styles = styles;

  /** Which device: `pixel_9_pro_xl`, `pixel_9_pro_fold` or `pixelbook_go`. */
  @property({reflect: true})
  device: DeviceName = 'pixel_9_pro_xl';

  /** Drop shadow under the device. */
  @property({type: Boolean, reflect: true})
  shadow = true;

  /** Page tone behind the device, which tunes the shadow. */
  @property({reflect: true})
  tone: 'light' | 'dark' = 'light';

  override render() {
    const dir = `device-frames/${this.device}`;
    if (this.device === 'pixelbook_go') {
      // The glare layer (land_fore) is left out so the app stays as clear as on the phones.
      return html`
        ${
          this.shadow
            ? html`<img
                class="shadow"
                src=${marketingAsset(`${dir}/land_shadow.png`)}
                alt=""
              />`
            : nothing
        }
        <img class="art" src=${marketingAsset(`${dir}/land_back.png`)} alt="" />
        <div class="screen"><slot></slot></div>
      `;
    }
    return html`
      <img class="art" src=${marketingAsset(`${dir}/back.webp`)} alt="" />
      <div class="screen">
        <slot></slot>
        <img class="mask" src=${marketingAsset(`${dir}/mask.webp`)} alt="" />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-device-frame': MaterialNextDeviceFrame;
  }
}
