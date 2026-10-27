/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from screen-card.scss.
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
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-radius: 28px;
    overflow: hidden;
    background: var(--mnw-hub-surface);
    border: 1px solid var(--mnw-hub-border-subtle);
    box-shadow: var(--mnw-hub-shadow-card);
    transition:
      box-shadow 200ms cubic-bezier(0.2, 0, 0, 1),
      transform 200ms cubic-bezier(0.2, 0, 0, 1);
    animation: enter 320ms cubic-bezier(0.2, 0, 0, 1) both;
    animation-delay: calc(min(var(--mnw-card-index, 0), 6) * 40ms);
  }

  :host(:hover) {
    box-shadow: var(--mnw-hub-shadow-raised);
  }

  .preview {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--mnw-hub-stage);
    overflow: hidden;
  }

  :host([framed]) .preview {
    padding: 24px 16px;
    min-height: 480px;
  }

  :host([framed]) ::slotted(*) {
    zoom: var(--mnw-card-device-zoom, 0.66);
  }

  :host(:not([framed])) .preview {
    height: var(--mnw-card-preview-height, clamp(560px, 75dvh, 760px));
    align-items: stretch;
  }

  :host(:not([framed])) ::slotted(*) {
    width: 100%;
    height: 100%;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    padding: 16px 20px 12px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h3 {
    margin: 0;
    min-width: 0;
    font: 500 18px/24px var(--_hub-font);
    letter-spacing: 0;
  }

  h3 a {
    color: var(--mnw-hub-text);
    text-decoration: none;
    border-radius: 4px;
    outline: none;
  }

  h3 a:hover {
    color: var(--mnw-hub-accent);
  }

  h3 a:focus-visible {
    outline: 2px solid var(--mnw-hub-accent);
    outline-offset: 2px;
  }

  .tag {
    flex-shrink: 0;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--mnw-hub-surface-low);
    border: 1px solid var(--mnw-hub-border-subtle);
    color: var(--mnw-hub-text-variant);
    font: 500 12px/16px var(--_hub-font);
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  p {
    margin: 0;
    max-width: 65ch;
    font: 400 14px/20px var(--_hub-font);
    color: var(--mnw-hub-text-variant);
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
  }

  .toggles {
    display: flex;
    gap: 4px;
    --md-icon-button-icon-color: var(--mnw-hub-text-variant);
    --md-icon-button-selected-icon-color: var(--mnw-hub-accent);
    --md-icon-button-selected-hover-icon-color: var(--mnw-hub-accent);
    --md-icon-button-selected-focus-icon-color: var(--mnw-hub-accent);
  }

  .filled {
    font-variation-settings: 'FILL' 1;
  }

  md-filled-tonal-button {
    --md-filled-tonal-button-label-text-font: var(--_hub-font);
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :host {
      animation: none;
      transition: none;
    }
  }
`;
