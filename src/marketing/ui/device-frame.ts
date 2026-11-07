/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {
  PIXEL_9_PRO_XL,
  PIXEL_FINISHES,
  type PixelFinish,
} from '../domain/pixel.js';
import type {DeviceName} from '../domain/windows.js';
import {marketingAsset} from './assets.js';
import {styles} from './device-frame-styles.js';

// The phone is drawn at the scale that makes its display the phone window:
// 70.8 mm across is 430 CSS px (1 dp = 1 px).
const P = PIXEL_9_PRO_XL;
const SCALE = 430 / P.display.width;
const WIDTH = P.width * SCALE;
const HEIGHT = P.height * SCALE;
/** The display's face, in front of the phone's centre. */
const FACE = (P.depth / 2 + 0.1) * SCALE;
/** How far anything stands from the centre: the camera bar on the back. */
const REACH = (P.depth / 2 + P.visor.raise) * SCALE;
/** The keys stand proud of the right edge. */
const KEYS = (P.keys.proud + 0.1) * SCALE;
const MARGIN = 4;

/**
 * The rectangle a pose needs around the phone's centre, in CSS px: the
 * phone's box turned as CSS turns the screen, seen through the perspective.
 */
const extent = (yaw: number, pitch: number, perspective: number) => {
  if (!yaw && !pitch)
    return {
      halfWidth: Math.ceil(WIDTH / 2 + KEYS + MARGIN),
      halfHeight: Math.ceil(HEIGHT / 2 + MARGIN),
    };
  const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)];
  const [cp, sp] = [Math.cos(pitch), Math.sin(pitch)];
  let x = 0;
  let y = 0;
  for (const px of [-WIDTH / 2 - KEYS, WIDTH / 2 + KEYS])
    for (const py of [-HEIGHT / 2, HEIGHT / 2])
      for (const pz of [-REACH, REACH]) {
        // rotateY, then rotateX, in CSS's axes (y down, z towards the viewer).
        const x1 = px * cy + pz * sy;
        const z1 = -px * sy + pz * cy;
        const y2 = py * cp - z1 * sp;
        const z2 = py * sp + z1 * cp;
        const k = perspective / (perspective - z2);
        x = Math.max(x, Math.abs(x1 * k));
        y = Math.max(y, Math.abs(y2 * k));
      }
  return {halfWidth: Math.ceil(x + MARGIN), halfHeight: Math.ceil(y + MARGIN)};
};

const hex = (colour: number) => `#${colour.toString(16).padStart(6, '0')}`;

/**
 * A device around a slotted app screen. The phone is a Pixel 9 Pro XL drawn in
 * 3D with three.js, from Google's published measurements, in any of its four
 * finishes and at any angle; the fold (a Pixel 9 Pro Fold, open) and the
 * desktop (a Pixelbook Go) are Google's device art. The slotted screen stays
 * live in light DOM, so the app's CSS and events apply, and it is laid over the
 * phone's display, turning with it.
 *
 * The phone's picture is drawn once per finish and pose and shared by every
 * frame on the page. Until it is ready, and where WebGL is unavailable, the
 * frame draws the phone's outline in CSS. `updateComplete` waits for it.
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

  /** The phone's finish: `obsidian`, `porcelain`, `hazel` or `rose-quartz`. */
  @property({reflect: true})
  finish: PixelFinish = 'obsidian';

  /**
   * Degrees the phone turns about its vertical axis; positive turns its right
   * edge away. Beyond 90 the back faces the viewer. Default `0`, head on.
   */
  @property({type: Number})
  yaw = 0;

  /** Degrees the phone leans about its horizontal axis; positive leans the top away. Default `0`. */
  @property({type: Number})
  pitch = 0;

  /** How far the viewer stands from a turned phone, in CSS px. Default `2400`. */
  @property({type: Number})
  perspective = 2400;

  /**
   * A mark for the phone's back, as the URL of a white-on-transparent image.
   * None by default. It shows when `yaw` turns the back towards the viewer.
   */
  @property()
  logo?: string;

  @state() private picture?: string;
  @state() private extent = extent(0, 0, 0);
  private painted: Promise<unknown> = Promise.resolve();

  override willUpdate(changed: PropertyValues<this>) {
    const phoneChanged = [
      'device',
      'finish',
      'yaw',
      'pitch',
      'perspective',
      'logo',
    ].some((name) => changed.has(name as keyof MaterialNextDeviceFrame));
    if (phoneChanged && this.device === 'pixel_9_pro_xl') this.paint();
  }

  protected override async getUpdateComplete() {
    const done = await super.getUpdateComplete();
    await this.painted;
    return done;
  }

  private get turned() {
    return !!(this.yaw || this.pitch);
  }

  private paint() {
    const radians = Math.PI / 180;
    const perspective = this.turned ? this.perspective : 0;
    const box = extent(this.yaw * radians, this.pitch * radians, perspective);
    this.extent = box;
    const request = {
      finish: PIXEL_FINISHES[this.finish] ? this.finish : 'obsidian',
      yaw: this.yaw,
      pitch: this.pitch,
      logo: this.logo,
      scale: SCALE,
      perspective,
      ...box,
      ratio: Math.min(2, Math.max(1, globalThis.devicePixelRatio || 1)),
    } as const;
    const painted = import('./pixel-render.js')
      .then(({renderPixel}) => renderPixel(request))
      .then(
        (picture) => {
          if (this.painted === painted) this.picture = picture;
        },
        () => {
          // No WebGL here: the outline drawn in CSS stays.
          if (this.painted === painted) this.picture = undefined;
        }
      );
    this.painted = painted;
  }

  override render() {
    if (this.device === 'pixel_9_pro_xl') return this.renderPhone();
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

  private renderPhone() {
    const {halfWidth, halfHeight} = this.extent;
    const turned = this.turned;
    const finish = PIXEL_FINISHES[this.finish] ?? PIXEL_FINISHES.obsidian;
    return html`
      <div
        class="stage"
        style=${styleMap(turned ? {perspective: `${this.perspective}px`} : {})}
      >
        ${
          this.picture
            ? html`<img
                class="phone"
                src=${this.picture}
                alt=""
                style=${styleMap({
                  left: `${WIDTH / 2 - halfWidth}px`,
                  top: `${HEIGHT / 2 - halfHeight}px`,
                  width: `${2 * halfWidth}px`,
                  height: `${2 * halfHeight}px`,
                })}
              />`
            : nothing
        }
        <div
          class=${this.picture ? 'body' : 'body body--drawn'}
          style=${styleMap({
            '--_frame': hex(finish.frame),
            transform: turned
              ? `rotateX(${this.pitch}deg) rotateY(${this.yaw}deg)`
              : undefined,
          })}
        >
          <div
            class="screen"
            style=${styleMap({
              transform: turned ? `translateZ(${FACE}px)` : undefined,
            })}
          >
            <slot></slot>
            <div class="camera"></div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-device-frame': MaterialNextDeviceFrame;
  }
}
