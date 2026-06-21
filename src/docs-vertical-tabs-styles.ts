/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from docs-vertical-tabs.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: block;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: "Google Sans Flex", system-ui, sans-serif;
}

nav {
  display: grid;
  gap: 8px;
}

.heading {
  margin: 0 0 8px;
  color: var(--md-sys-color-primary, #6750a4);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.item {
  --md-list-list-item-container-shape: 999px;
  --md-list-list-item-label-text-font: 'Google Sans Flex', system-ui, sans-serif;
  border-radius: 999px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  text-decoration: none;
}

.item.active {
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
}

md-icon {
  color: currentColor;
}`;
