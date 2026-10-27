/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from color-picker.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font: 400 1rem/1.5rem var(--md-ref-typeface-plain, system-ui, sans-serif);
  }

  .swatch-row,
  .sliders {
    border-radius: var(--mnw-color-picker-shape, 20px);
    background: var(
      --mnw-color-picker-container-color,
      var(--md-sys-color-surface-container-high, #ece6f0)
    );
  }

  .swatch-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 12px 12px 16px;
    cursor: pointer;
  }

  .swatch-label {
    flex: 1;
    min-width: 0;
    color: var(--md-sys-color-on-surface, #1d1b20);
  }

  .hex {
    font-family: var(--mnw-color-picker-code-font, ui-monospace, monospace);
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  .swatch {
    position: relative;
    flex: none;
    width: 48px;
    height: 48px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: 50%;
    background: var(--_swatch);
    box-sizing: border-box;
  }

  .swatch input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    opacity: 0;
    cursor: pointer;
  }

  md-focus-ring {
    border-radius: 50%;
  }

  .sliders {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 8px 24px;
    --md-slider-inactive-track-color: var(
      --md-sys-color-on-surface-variant,
      #49454f
    );
  }

  @media (forced-colors: active) {
    .swatch-row,
    .sliders {
      border: 1px solid CanvasText;
    }
    .swatch {
      forced-color-adjust: none;
    }
  }
`;
