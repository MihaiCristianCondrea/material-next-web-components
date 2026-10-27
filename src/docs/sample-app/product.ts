/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {MarketingProduct} from '../../marketing/index.js';

/** Pocket Notes is the documentation sample, not a real product. */
export const PRODUCT: MarketingProduct = {
  id: 'pocket-notes-sample',
  name: 'Pocket Notes',
  // The bundles sit at the site root, next to demos/.
  icon: new URL('./demos/assets/pocket-notes-icon.svg', import.meta.url).href,
  privacyUrl: 'https://mihaicristiancondrea.github.io/profile/#privacy-policy',
  codeOfConductUrl:
    'https://mihaicristiancondrea.github.io/profile/#code-of-conduct',
};

/** The app's palettes, defined in pocket-notes.css. */
export const PALETTES = ['ocean', 'clay'];
