/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {MarketingProduct} from '../../marketing/index.js';

/**
 * Pocket Notes is the documentation's sample app, not a real product: its
 * store link goes to Google Play's home page and its source link to this
 * library.
 */
export const PRODUCT: MarketingProduct = {
  id: 'pocket-notes-sample',
  name: 'Pocket Notes',
  // The bundles sit at the site root, next to demos/.
  icon: new URL('./demos/assets/pocket-notes-icon.svg', import.meta.url).href,
  storeUrl: 'https://play.google.com/store',
  repositoryUrl:
    'https://github.com/MihaiCristianCondrea/material-next-web-components',
  privacyUrl: 'https://mihaicristiancondrea.github.io/profile/#privacy-policy',
  codeOfConductUrl:
    'https://mihaicristiancondrea.github.io/profile/#code-of-conduct',
  credit: 'Sample app of the Material Next documentation',
};

/** The app's palettes, defined in pocket-notes.css. */
export const PALETTES = ['ocean', 'clay'];
