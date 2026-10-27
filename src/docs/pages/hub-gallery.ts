/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// The sample hub (demos/marketing-hub/index.html): the gallery, and each
// screen's prototype in the same page. An app's
// marketing/ui/src/gallery-page.js is the same few lines.
import {
  configureMarketingAssets,
  mountMarketingHub,
} from '../../marketing/index.js';
import {PALETTES, PRODUCT} from '../sample-app/product.js';
import {SCREENS} from '../sample-app/screens.js';

// This site serves the copied assets from its root, under the Pages subpath.
configureMarketingAssets({
  base: new URL('./material-next/', import.meta.url).href,
});

mountMarketingHub({
  product: PRODUCT,
  navigationMode:
    new URL(location.href).searchParams.get('drawer') === 'auto'
      ? 'auto'
      : 'modal',
  screens: SCREENS,
  palettes: PALETTES,
});
