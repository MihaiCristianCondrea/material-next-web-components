/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from theme-button.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
  }

  :host([open]) .trigger {
    --md-icon-button-icon-color: var(--md-sys-color-primary, #6750a4);
    --md-icon-button-hover-icon-color: var(--md-sys-color-primary, #6750a4);
    --md-icon-button-focus-icon-color: var(--md-sys-color-primary, #6750a4);
  }

  .popover {
    position: fixed;
    inset: auto;
    top: var(--_top, 64px);
    inset-inline-end: var(--_end, 8px);
    width: min(var(--mnw-theme-panel-width, 320px), 100vw - 16px);
    max-height: calc(100dvh - var(--_top, 64px) - 16px);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    overflow: visible;
    z-index: 60;
  }

  .popover:not([data-open]) {
    display: none;
  }

  .popover::backdrop {
    background: transparent;
    pointer-events: none;
  }

  .panel {
    box-sizing: border-box;
    max-height: inherit;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 16px;
    border-radius: 28px;
    background: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1d1b20);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 16px 48px rgba(0, 0, 0, 0.16);
    transform-origin: top right;
    animation: open 220ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  :host(:dir(rtl)) .panel {
    transform-origin: top left;
  }

  mnw-theme-controls {
    outline: none;
  }

  @keyframes open {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .panel {
      animation: none;
    }
  }
  @media (forced-colors: active) {
    .panel {
      border: 1px solid CanvasText;
    }
  }
`;
