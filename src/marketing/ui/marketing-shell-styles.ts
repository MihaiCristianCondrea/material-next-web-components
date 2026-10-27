/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from marketing-shell.scss.
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
    min-height: 100vh;
    background: var(--mnw-hub-bg);
    color: var(--mnw-hub-text);
  }

  .settings {
    display: inline-flex;
  }

  :host([settings-open]) .settings-trigger {
    --md-icon-button-icon-color: var(--mnw-hub-accent);
    --md-icon-button-hover-icon-color: var(--mnw-hub-accent);
    --md-icon-button-focus-icon-color: var(--mnw-hub-accent);
  }

  .popover {
    position: fixed;
    inset: auto;
    top: var(--_top, 64px);
    inset-inline-end: var(--_end, 8px);
    width: min(var(--mnw-hub-settings-width, 360px), 100vw - 16px);
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
    background: var(--mnw-hub-surface);
    color: var(--mnw-hub-text);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 16px 48px rgba(0, 0, 0, 0.16);
    transform-origin: top right;
    animation: anchored-panel-open 220ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  :host(:dir(rtl)) .panel {
    transform-origin: top left;
  }

  @keyframes anchored-panel-open {
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
  .panel {
    padding: 20px;
  }

  mnw-preview-controls {
    outline: none;
  }

  #catalog {
    flex: 1;
    padding: 28px clamp(16px, 3vw, 32px) 48px;
    outline: none;
  }

  .catalog-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
    margin-bottom: 20px;
  }

  h2 {
    margin: 0;
    font: 400 24px/32px var(--_hub-font);
    color: var(--mnw-hub-text);
  }

  .count {
    color: var(--mnw-hub-text-subtle);
  }

  md-chip-set {
    --md-filter-chip-label-text-font: var(--_hub-font);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
    gap: 24px;
  }

  .empty {
    display: grid;
    place-items: center;
    gap: 8px;
    padding: 64px 24px;
    border-radius: 28px;
    border: 1px dashed var(--mnw-hub-border);
    color: var(--mnw-hub-text-variant);
    text-align: center;
    font: 400 14px/20px var(--_hub-font);
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px 32px;
    padding: 28px clamp(16px, 3vw, 32px) 36px;
    border-top: 1px solid var(--mnw-hub-border-subtle);
    background: var(--mnw-hub-surface-low);
    color: var(--mnw-hub-text-variant);
    font: 400 13px/20px var(--_hub-font);
  }

  .footer__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .footer__product {
    color: var(--mnw-hub-text);
    font-weight: 500;
  }

  .footer__links {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
  }

  footer a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--mnw-hub-accent);
    text-decoration: none;
    border-radius: 4px;
    --md-icon-size: 18px;
  }

  footer a:hover {
    text-decoration: underline;
  }

  footer a:focus-visible {
    outline: 2px solid var(--mnw-hub-accent);
    outline-offset: 2px;
  }

  .trademark {
    flex-basis: 100%;
    color: var(--mnw-hub-text-subtle);
    font-size: 12px;
  }

  @media (max-width: 600px) {
    .controls {
      position: static;
    }
    #catalog {
      padding-top: 20px;
    }
  }
  ::slotted([slot='extra']) {
    display: block;
    padding: 0 clamp(16px, 3vw, 32px) 48px;
  }

  .drawer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    color: inherit;
    font-size: 18px;
    font-weight: 500;
    text-decoration: none;
  }

  .drawer-brand img {
    border-radius: 8px;
    flex: none;
  }

  #catalog {
    box-sizing: border-box;
    width: 100%;
    max-width: 1312px;
    margin-inline: auto;
  }
`;
