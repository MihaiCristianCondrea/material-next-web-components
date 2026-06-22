/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from docs-page.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: block;
  width: min(100% - var(--mnw-docs-page-inline-gutter, 32px), var(--mnw-docs-page-max-width, 1120px));
  margin: 0 auto;
  padding: var(--mnw-docs-page-padding-block, 32px) 0 24px;
  font-family: "Google Sans Flex", system-ui, sans-serif;
}

.docs-content {
  min-width: 0;
}

@media (max-width: 820px) {
  :host {
    --mnw-docs-page-padding-block: 24px;
  }
}`;
