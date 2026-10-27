/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from navigation-item.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: block;
    -webkit-tap-highlight-color: transparent;
  }

  a {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    min-height: var(--mnw-navigation-item-height, 48px);
    padding: 0 24px 0 16px;
    border-radius: 999px;
    outline: none;
    color: var(--md-sys-color-on-surface-variant, #44474c);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.006em;
    line-height: 1.25rem;
    text-decoration: none;
    --md-focus-ring-shape: 999px;
    --md-ripple-hover-color: var(--md-sys-color-on-surface, #1b1c1e);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface, #1b1c1e);
  }

  :host([active]) a {
    background: var(--md-sys-color-secondary-container, #d3e3fd);
    color: var(--md-sys-color-on-secondary-container, #041e49);
    --md-ripple-hover-color: var(
      --md-sys-color-on-secondary-container,
      #041e49
    );
    --md-ripple-pressed-color: var(
      --md-sys-color-on-secondary-container,
      #041e49
    );
  }

  .icon {
    display: inline-flex;
    flex: none;
  }

  .icon md-icon,
  ::slotted([slot='icon']) {
    --md-icon-size: 24px;
    width: 24px;
    height: 24px;
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    flex: none;
    font-size: 0.75rem;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
