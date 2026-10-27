/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from prototype-layout.scss.
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
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 24px;
    min-height: 100vh;
    padding: 24px;
    box-sizing: border-box;
    background: var(--mnw-hub-bg);
    color: var(--mnw-hub-text);
  }

  .stage {
    position: sticky;
    top: 24px;
    height: calc(100dvh - 48px);
    min-width: 0;
    display: grid;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
    place-items: center;
    overflow: clip;
    overflow-clip-margin: 24px;
  }

  ::slotted([slot='stage']) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
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
  }
`;
