/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from screen-inspector.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    --_hub-font: var(
      --mnw-hub-font,
      'Google Sans Flex',
      'Google Sans',
      system-ui,
      sans-serif
    );
    font-family: var(--_hub-font);
    --md-ref-typeface-plain: var(--_hub-font);
    --md-ref-typeface-brand: var(--_hub-font);
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 24px;
    border-radius: 28px;
    background: var(--mnw-hub-surface);
    border: 1px solid var(--mnw-hub-border-subtle);
    box-shadow: var(--mnw-hub-shadow-card);
    color: var(--mnw-hub-text);
    --md-outlined-button-label-text-font: var(--_hub-font);
    --md-text-button-label-text-font: var(--_hub-font);
  }

  .back {
    align-self: flex-start;
    margin-bottom: 12px;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tag {
    font: 500 12px/16px var(--_hub-font);
    letter-spacing: 0.5px;
    color: var(--mnw-hub-accent);
  }

  h1 {
    margin: 0;
    font: 400 24px/32px var(--_hub-font);
  }

  p {
    margin: 0;
    font: 400 14px/20px var(--_hub-font);
    color: var(--mnw-hub-text-variant);
  }

  code {
    font:
      400 12px/16px ui-monospace,
      'Google Sans Code',
      monospace;
    color: var(--mnw-hub-text-subtle);
    word-break: break-all;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--mnw-hub-border-subtle);
  }

  .label,
  .control__label {
    font: 500 12px/16px var(--_hub-font);
    letter-spacing: 0.5px;
    color: var(--mnw-hub-text-variant);
  }

  md-outlined-select {
    width: 100%;
    --md-outlined-field-top-space: 8px;
    --md-outlined-field-bottom-space: 8px;
    --md-outlined-field-container-shape: 20px;
  }

  md-outlined-segmented-button-set {
    width: 100%;
    --md-outlined-segmented-button-container-height: 40px;
  }

  .switch-row,
  .control--row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    font: 500 14px/20px var(--_hub-font);
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .control__row {
    display: flex;
    justify-content: space-between;
  }

  .control__value {
    font: 500 14px/20px var(--_hub-font);
    font-variant-numeric: tabular-nums;
  }

  md-slider {
    width: 100%;
  }

  .actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;
