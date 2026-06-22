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
  grid-template-columns: minmax(220px, 1fr) auto auto;
  gap: 24px;
  align-items: center;
  width: 100%;
  padding: 14px clamp(16px, 5vw, 64px);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  background: color-mix(in srgb, var(--md-sys-color-surface, #fffbfe) 92%, transparent);
  color: var(--md-sys-color-on-surface, #1d1b20);
  backdrop-filter: blur(18px);
}

.nav {
  justify-self: end;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: var(--md-sys-color-surface-container, #f3edf7);
}

.trailing {
  justify-self: end;
}

::slotted(a) {
  color: inherit;
  text-decoration: none;
}

@media (max-width: 960px) {
  :host {
    grid-template-columns: 1fr;
  }
  .nav,
  .trailing {
    justify-self: stretch;
  }
}`;
