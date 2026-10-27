/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from site-footer.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from './scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: block;
    padding: 16px clamp(16px, 3vw, 32px);
    color: var(--md-sys-color-on-surface-variant, #44474c);
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
    padding: 12px 20px;
    border-radius: 28px;
    background: var(--md-sys-color-surface-container, #edeef4);
    font: 400 14px/20px
      var(--md-ref-typeface-plain, 'Google Sans Flex', system-ui, sans-serif);
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  nav[hidden] {
    display: none;
  }

  ::slotted(a) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 4px 10px;
    border-radius: 999px;
    color: inherit;
    text-decoration: none;
  }

  ::slotted(a:hover) {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  ::slotted(a:focus-visible) {
    outline: 2px solid var(--md-sys-color-primary, #0b57d0);
    outline-offset: 2px;
  }

  @media (max-width: 599px) {
    footer {
      padding: 16px;
    }
  }
`;
