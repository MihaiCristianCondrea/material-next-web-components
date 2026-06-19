/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from material-next-home.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: block;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: 'Google Sans Flex', system-ui, sans-serif;
  font-optical-sizing: auto;
  font-variation-settings: 'slnt' 0, 'wdth' 100, 'GRAD' 0, 'ROND' 0;
}

.hero {
  display: grid;
  gap: 24px;
  padding: 40px;
  border-radius: 28px;
  background: var(--md-sys-color-surface-container-high, #ece6f0);
}

.eyebrow {
  margin: 0;
  color: var(--md-sys-color-primary, #6750a4);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 0.95;
}

p {
  max-width: 720px;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
}
`;
