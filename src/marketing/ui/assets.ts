/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Where the shipped marketing assets (device frames, the Google Play badge)
 * are served from. Bundlers do not serve files inside packages reliably, so a
 * hub copies them into its public folder with `npx mnw-marketing-assets
 * public/material-next` and the default base points there.
 */
let assetBase = '/material-next/';

export const configureMarketingAssets = ({base}: {base: string}) => {
  assetBase = base.endsWith('/') ? base : `${base}/`;
};

/** The URL of a shipped asset, for example `device-frames/pixel_9_pro_xl/back.webp`. */
export const marketingAsset = (path: string) =>
  `${assetBase}${path.replace(/^\/+/, '')}`;
