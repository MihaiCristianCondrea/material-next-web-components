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
  headline: 'Every Pocket Notes screen, live',
  description:
    'A sample marketing hub. Tap the notes, switch the theme and palette, or open a screen as a prototype.',
  storeUrl: 'https://play.google.com/store',
  repositoryUrl:
    'https://github.com/MihaiCristianCondrea/material-next-web-components',
  credit: 'Sample app of the Material Next documentation',
};

/** The app's palettes, defined in pocket-notes.css. */
export const PALETTES = ['ocean', 'clay'];
