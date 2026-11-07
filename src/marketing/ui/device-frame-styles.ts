/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from device-frame.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    position: relative;
    display: block;
    flex-shrink: 0;
    width: 465.23px;
    height: 988.76px;
    --_screen-left: 17.61px;
    --_screen-top: 15.79px;
    --_screen-width: 430px;
    --_screen-height: 957px;
    --_screen-radius: 49.8px;
    --_camera-top: 30.97px;
    --_camera-size: 21.86px;
    --_body-radius: 74.1px;
  }

  :host([device='pixel_9_pro_fold']) {
    width: 904.53px;
    height: 933.27px;
    --_screen-left: 25.45px;
    --_screen-top: 25.45px;
    --_screen-width: 852px;
    --_screen-height: 883px;
    --_screen-radius: 48px;
  }

  :host([device='pixelbook_go']) {
    width: 1459.47px;
    height: 973.2px;
    --_screen-left: 120.73px;
    --_screen-top: 106.06px;
    --_screen-width: 1218px;
    --_screen-height: 720px;
    --_screen-radius: 0px;
  }

  :host([shadow]:not([device='pixelbook_go'])) {
    filter: drop-shadow(0 32px 70px rgba(16, 32, 64, 0.16))
      drop-shadow(0 8px 24px rgba(16, 32, 64, 0.1));
  }

  :host([shadow][tone='dark']:not([device='pixelbook_go'])) {
    filter: drop-shadow(0 40px 90px rgba(0, 0, 0, 0.65))
      drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
  }

  .art,
  .shadow,
  .mask {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;
  }

  .shadow {
    z-index: 0;
  }

  .art {
    z-index: 1;
  }

  .screen {
    position: absolute;
    left: var(--_screen-left);
    top: var(--_screen-top);
    width: var(--_screen-width);
    height: var(--_screen-height);
    border-radius: var(--_screen-radius);
    overflow: hidden;
    z-index: 2;
    background: #0b0b0c;
  }

  .screen .mask {
    z-index: 10;
  }

  ::slotted(*) {
    width: var(--_screen-width) !important;
    height: var(--_screen-height) !important;
    border-radius: var(--_screen-radius);
  }

  .stage {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .phone {
    position: absolute;
    pointer-events: none;
    user-select: none;
  }

  .body {
    position: absolute;
    inset: 0;
    border-radius: var(--_body-radius);
    transform-style: preserve-3d;
  }

  .body--drawn {
    background: #050608;
    box-shadow: inset 0 0 0 5px var(--_frame);
  }

  .body .screen {
    backface-visibility: hidden;
  }

  .camera {
    position: absolute;
    z-index: 10;
    top: calc(var(--_camera-top) - var(--_camera-size) / 2);
    left: calc(50% - var(--_camera-size) / 2);
    width: var(--_camera-size);
    height: var(--_camera-size);
    border-radius: 50%;
    background: #020203;
    box-shadow: 0 0 0 3.6px #0c0d10;
    pointer-events: none;
  }
`;
