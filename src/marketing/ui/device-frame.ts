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
/** While the phone moves it is drawn at one device pixel per CSS pixel; settled, at the screen's density. */
const MOVING_RATIO = 1;
/** How long a pose has to stay still before the sharp picture replaces the moving one, in ms. */
const SETTLE = 280;

/**
 * The rectangle a pose needs around the phone's centre, in CSS px: the
 * phone's box turned as CSS turns the screen, behind the screen's plane by
 * the display's depth, seen through the perspective.
 */
const extent = (yaw: number, pitch: number, perspective: number) => {
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
        const z2 = py * sp + z1 * cp - FACE;
        const k = perspective / (perspective - z2);
        x = Math.max(x, Math.abs(x1 * k));
        y = Math.max(y, Math.abs(y2 * k));
      }
  return {halfWidth: Math.ceil(x + MARGIN), halfHeight: Math.ceil(y + MARGIN)};
};

/** Rounds up to a multiple of 32, so a moving phone's canvas is rarely resized. */
const bucket = (n: number) => Math.ceil(n / 32) * 32;

const density = () =>
  Math.min(2, Math.max(1, globalThis.devicePixelRatio || 1));

type Renderer = typeof import('./pixel-render.js');
let renderer: Promise<Renderer> | undefined;
const loadRenderer = () => (renderer ??= import('./pixel-render.js'));

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
  /** Drawn every frame into a canvas while the pose keeps changing. */
  @state() private moving = false;
  @state() private extent = extent(0, 0, 2400);
  private painted: Promise<unknown> = Promise.resolve();
  private lastPose = -Infinity;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private frameRequest = 0;
  private visible = true;
  private observer?: IntersectionObserver;

  override connectedCallback() {
    super.connectedCallback();
    // Off screen, a moving phone is not drawn; it catches up when it is back.
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
          if (this.visible && this.moving) this.requestFrame();
        },
        {rootMargin: '25%'}
      );
      this.observer.observe(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    clearTimeout(this.settleTimer);
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (this.device !== 'pixel_9_pro_xl') return;
    const has = (name: string) =>
      changed.has(name as keyof MaterialNextDeviceFrame);
    const look = ['device', 'finish', 'logo'].some(has);
    const pose = ['yaw', 'pitch', 'perspective'].some(has);
    if (!look && !pose) return;
    const now = performance.now();
    // A pose that changes again soon after the last is moving: draw it
    // straight to a canvas each frame, and the sharp picture once it settles.
    const keepsMoving =
      pose && !look && this.hasUpdated && now - this.lastPose < SETTLE;
    if (pose) this.lastPose = now;
    if (keepsMoving || (this.moving && !look)) this.move();
    else this.paint();
  }

  protected override async getUpdateComplete() {
    const done = await super.getUpdateComplete();
    await this.painted;
    return done;
  }

  private get turned() {
    return this.moving || !!(this.yaw || this.pitch);
  }

  private request(ratio: number, box = this.extent) {
    return {
      finish: PIXEL_FINISHES[this.finish] ? this.finish : 'obsidian',
      yaw: this.yaw,
      pitch: this.pitch,
      logo: this.logo,
      scale: SCALE,
      perspective: this.perspective,
      depth: FACE,
      ...box,
      ratio,
    } as const;
  }

  private box(round = false) {
    const radians = Math.PI / 180;
    const box = extent(
      this.yaw * radians,
      this.pitch * radians,
      this.perspective
    );
    return round
      ? {halfWidth: bucket(box.halfWidth), halfHeight: bucket(box.halfHeight)}
      : box;
  }

  /** Draws the still pose as a shared picture, at the screen's density. */
  private paint() {
    clearTimeout(this.settleTimer);
    const box = this.box();
    const request = this.request(density(), box);
    const painted = loadRenderer()
      .then(({renderPixel}) => renderPixel(request))
      .then(
        (picture) => {
          if (this.painted !== painted) return;
          this.extent = box;
          this.picture = picture;
          this.moving = false;
        },
        () => {
          // No WebGL here: the outline drawn in CSS stays.
          if (this.painted !== painted) return;
          this.picture = undefined;
          this.moving = false;
        }
      );
    this.painted = painted;
  }

  /** Follows a moving pose: one draw per animation frame, then a sharp picture. */
  private move() {
    this.moving = true;
    // A picture still on its way belongs to an older pose.
    this.painted = Promise.resolve();
    this.extent = this.box(true);
    this.requestFrame();
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.paint(), SETTLE);
  }

  private requestFrame() {
    if (this.frameRequest || !this.visible) return;
    this.frameRequest = requestAnimationFrame(() => {
      this.frameRequest = 0;
      void this.drawFrame();
    });
  }

  private async drawFrame() {
    if (!this.moving || !this.visible) return;
    const canvas =
      this.renderRoot.querySelector<HTMLCanvasElement>('canvas.phone');
    if (!canvas) {
      this.requestFrame();
      return;
    }
    const render = await loadRenderer();
    const request = this.request(MOVING_RATIO);
    if (!render.drawPixel(request, canvas)) {
      // The finish is still loading: draw as soon as it is there.
      await render.preparePixel(request.finish, request.logo).catch(() => {});
      this.requestFrame();
    }
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
    const placement = {
      left: `${WIDTH / 2 - halfWidth}px`,
      top: `${HEIGHT / 2 - halfHeight}px`,
      width: `${2 * halfWidth}px`,
      height: `${2 * halfHeight}px`,
    };
    return html`
      <div
        class="stage"
        style=${styleMap(turned ? {perspective: `${this.perspective}px`} : {})}
      >
        ${
          this.moving
            ? html`<canvas class="phone" style=${styleMap(placement)}></canvas>`
            : this.picture
              ? html`<img
                  class="phone"
                  src=${this.picture}
                  alt=""
                  style=${styleMap(placement)}
                />`
              : nothing
        }
        <div
          class=${this.picture || this.moving ? 'body' : 'body body--drawn'}
          style=${styleMap({
            '--_frame': hex(finish.frame),
            // The phone turns about its centre, which sits the display's depth
            // behind the screen's plane, so head on the screen is unscaled.
            transform: turned
              ? `translateZ(${-FACE}px) rotateX(${this.pitch}deg) rotateY(${this.yaw}deg)`
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
