/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from theme-controls.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: var(--md-sys-color-on-surface, #1d1b20);
    font-family: var(--md-ref-typeface-plain, system-ui, sans-serif);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
  }

  .heading {
    flex: 1;
    margin: 0;
    font: 500 1.375rem/1.75rem
      var(--md-ref-typeface-brand, system-ui, sans-serif);
  }

  md-outlined-segmented-button-set {
    width: 100%;
  }
`;
