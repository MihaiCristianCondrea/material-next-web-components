/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from device-frame.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
  :host {
    position: relative;
    display: block;
    flex-shrink: 0;
    width: 469px;
    height: 992px;
    --_screen-left: 18.24px;
    --_screen-top: 17.92px;
    --_screen-width: 430px;
    --_screen-height: 957px;
    --_screen-radius: 34.5px;
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
`;
