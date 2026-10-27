/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from docs-top-app-bar.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
  :host {
    position: sticky;
    top: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'leading nav trailing';
    gap: 24px;
    align-items: center;
    width: 100%;
    min-height: 64px;
    padding: 8px clamp(16px, 4vw, 48px);
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    background: color-mix(
      in srgb,
      var(--md-sys-color-surface, #fffbfe) 92%,
      transparent
    );
    color: var(--md-sys-color-on-surface, #1d1b20);
    backdrop-filter: blur(18px);
  }

  .leading {
    grid-area: leading;
    min-width: 0;
  }

  .nav {
    grid-area: nav;
    justify-self: end;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .trailing {
    grid-area: trailing;
    justify-self: end;
  }

  ::slotted(a) {
    color: inherit;
    text-decoration: none;
  }

  @media (max-width: 960px) {
    :host {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas: 'leading trailing' 'nav nav';
      gap: 4px 16px;
      padding-block: 8px 4px;
    }
    .nav {
      justify-self: stretch;
    }
  }
  @media (max-width: 600px) {
    :host {
      position: static;
    }
  }
`;
