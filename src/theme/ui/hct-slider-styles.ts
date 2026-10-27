/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from hct-slider.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: flex;
    flex-direction: column;
    gap: 4px;
    --_inset: calc(var(--md-slider-handle-width, 20px) / 2);
  }

  .label {
    margin-inline: var(--_inset);
    font: 400 1rem/1.5rem var(--md-ref-typeface-plain, system-ui, sans-serif);
  }

  md-slider {
    width: 100%;
  }

  .gradient {
    box-sizing: border-box;
    height: 24px;
    margin-inline: var(--_inset);
    border: 1px solid currentColor;
    border-radius: 12px;
  }

  @media (forced-colors: active) {
    .gradient {
      forced-color-adjust: none;
      border-color: CanvasText;
    }
  }
`;
