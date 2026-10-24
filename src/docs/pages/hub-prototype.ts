/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// The sample prototype page (demos/marketing-hub/screen.html).
import {
  configureMarketingAssets,
  mountScreenPrototype,
} from '../../marketing/index.js';
import {PALETTES, PRODUCT} from '../sample-app/product.js';
import {SCREENS} from '../sample-app/screens.js';

configureMarketingAssets({
  base: new URL('./material-next/', import.meta.url).href,
});

mountScreenPrototype({
  product: PRODUCT,
  screens: SCREENS,
  palettes: PALETTES,
  galleryUrl: './',
});
