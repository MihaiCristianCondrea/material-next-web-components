/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from prototype-layout.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: var(--mnw-hub-bg);
  color: var(--mnw-hub-text);
  font-family: var(--mnw-hub-font);
}

.stage {
  position: sticky;
  top: 24px;
  height: calc(100dvh - 48px);
  min-width: 0;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: var(--mnw-hub-stage);
  border: 1px solid var(--mnw-hub-border-subtle);
  overflow: auto;
}

::slotted([slot=stage]) {
  width: 100%;
  height: 100%;
}

.panel {
  align-self: start;
  min-width: 0;
}

@media (max-width: 1000px) {
  :host {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }
  .stage {
    position: static;
    height: 80dvh;
  }
}`;
