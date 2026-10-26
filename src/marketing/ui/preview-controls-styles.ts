/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from preview-controls.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
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
  display: block;
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px 28px;
}

.group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.label {
  font: 500 12px/16px var(--_hub-font);
  letter-spacing: 0.5px;
  color: var(--mnw-hub-text-variant);
  user-select: none;
}

md-outlined-segmented-button-set {
  --md-outlined-segmented-button-container-height: 40px;
  --md-outlined-segmented-button-label-text-font: var(--_hub-font);
}

md-outlined-select {
  width: 188px;
  --md-outlined-field-top-space: 8px;
  --md-outlined-field-bottom-space: 8px;
  --md-outlined-select-text-field-input-text-font: var(--_hub-font);
  --md-outlined-field-container-shape: 20px;
}

.switch {
  display: flex;
  align-items: center;
  height: 40px;
}

.reset {
  margin-left: auto;
  align-self: center;
  --md-text-button-label-text-font: var(--_hub-font);
}

@media (max-width: 600px) {
  .bar {
    gap: 12px 16px;
  }
  md-outlined-select {
    width: 160px;
  }
  .reset {
    margin-left: 0;
  }
}`;
