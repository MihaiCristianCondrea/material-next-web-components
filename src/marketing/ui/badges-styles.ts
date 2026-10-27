/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from badges.scss.
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
    display: inline-flex;
    vertical-align: middle;
  }

  a {
    display: inline-flex;
    align-items: center;
    border-radius: 12px;
    color: inherit;
    text-decoration: none;
    outline: none;
    transition: transform 120ms cubic-bezier(0.2, 0, 0, 1);
  }

  a:focus-visible {
    outline: 2px solid var(--mnw-hub-accent, #0b57d0);
    outline-offset: 2px;
  }

  a:active {
    transform: scale(0.98);
  }

  .play img {
    display: block;
    height: var(--mnw-play-badge-height, 56px);
    width: auto;
  }

  .github {
    gap: 8px;
    height: 40px;
    padding: 0 16px 0 12px;
    border-radius: 20px;
    border: 1px solid var(--mnw-hub-border, rgba(23, 28, 36, 0.1));
    background: var(--mnw-hub-surface, #fff);
    color: var(--mnw-hub-text, #1b1c1e);
    font: 500 14px/20px var(--_hub-font);
    letter-spacing: 0.1px;
    white-space: nowrap;
    transition:
      background-color 150ms cubic-bezier(0.2, 0, 0, 1),
      transform 120ms cubic-bezier(0.2, 0, 0, 1);
  }

  .github:hover {
    background: var(--mnw-hub-surface-low, #f1f3f6);
  }

  .github svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
    flex-shrink: 0;
  }

  :host([compact]) .github {
    width: 40px;
    padding: 0;
    justify-content: center;
  }

  :host([compact]) .github .label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  @media (prefers-reduced-motion: reduce) {
    a,
    .github {
      transition: none;
    }
    a:active {
      transform: none;
    }
  }
`;
