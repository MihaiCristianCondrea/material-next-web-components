/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from marketing-top-app-bar.scss.
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
    position: sticky;
    top: 0;
    z-index: 20;
    display: block;
    background: var(--mnw-hub-bg);
    transition:
      background-color 200ms cubic-bezier(0.2, 0, 0, 1),
      box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  :host([scrolled]) {
    background: var(--mnw-hub-scrolled);
    box-shadow: inset 0 -1px 0 var(--mnw-hub-border-subtle);
    backdrop-filter: saturate(1.2) blur(16px);
    -webkit-backdrop-filter: saturate(1.2) blur(16px);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 64px;
    padding: 0 var(--mnw-hub-gutter, 16px);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 4px 8px 4px 4px;
    margin-left: -4px;
    border-radius: 12px;
    color: var(--mnw-hub-text);
    text-decoration: none;
    outline: none;
  }

  .brand:focus-visible {
    outline: 2px solid var(--mnw-hub-accent);
    outline-offset: 2px;
  }

  .brand img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .name {
    font: 500 18px/24px var(--_hub-font);
    letter-spacing: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .context {
    font: 400 14px/20px var(--_hub-font);
    color: var(--mnw-hub-text-subtle);
    white-space: nowrap;
  }

  .trailing {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  @media (max-width: 600px) {
    .context {
      display: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :host {
      transition: none;
    }
  }
`;
