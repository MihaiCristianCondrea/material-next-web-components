/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from navigation-group.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    display: block;
    color: var(--md-sys-color-on-surface-variant, #44474c);
  }

  button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    box-sizing: border-box;
    padding: 10px 16px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font: 500 14px/20px
      var(--md-ref-typeface-plain, 'Google Sans Flex', system-ui, sans-serif);
    text-align: start;
    cursor: pointer;
    --md-focus-ring-shape: 999px;
  }

  button.current {
    color: var(--md-sys-color-primary, #0b57d0);
  }

  .icon,
  .chevron {
    display: flex;
    flex: none;
    --md-icon-size: 24px;
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .chevron {
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  .children {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition:
      grid-template-rows 200ms cubic-bezier(0.2, 0, 0, 1),
      visibility 0s 200ms;
  }

  :host([open]) .children {
    grid-template-rows: 1fr;
    visibility: visible;
    transition-delay: 0s;
  }

  .clip {
    min-height: 0;
    overflow: hidden;
    padding-inline-start: 16px;
  }

  ::slotted(mnw-navigation-item) {
    display: block;
    margin-block: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .children,
    .chevron {
      transition: none;
    }
  }
`;
