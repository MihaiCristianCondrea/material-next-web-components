/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// The sample gallery page (demos/marketing-hub/index.html). An app's
// marketing/ui/src/gallery-page.js is the same few lines.
import {
  configureMarketingAssets,
  mountMarketingGallery,
} from '../../marketing/index.js';
import {PALETTES, PRODUCT} from '../sample-app/product.js';
import {SCREENS} from '../sample-app/screens.js';

// This site serves the copied assets from its root, under the Pages subpath.
configureMarketingAssets({
  base: new URL('./material-next/', import.meta.url).href,
});

mountMarketingGallery({
  product: PRODUCT,
  navigationMode:
    new URL(location.href).searchParams.get('drawer') === 'modal'
      ? 'modal'
      : 'auto',
  screens: SCREENS,
  palettes: PALETTES,
  prototypeUrl: 'screen.html',
});
