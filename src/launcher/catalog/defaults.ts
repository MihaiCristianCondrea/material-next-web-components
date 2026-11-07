/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {createLauncherCatalog} from '../domain/launcher-catalog.js';
import {launcherItem} from '../domain/launcher-item.js';

/**
 * The catalog <mnw-product-launcher> uses unless it is given another: Material
 * Next and the public consoles an Android developer works in, at their public
 * addresses. It names no one's own products; an app passes its own catalog
 * with its products, admin consoles and links.
 */
export const DEFAULT_LAUNCHER_ITEMS = [
  launcherItem({
    kind: 'web',
    key: 'material-next',
    title: 'Material-Next',
    subtitle: 'Web components',
    href: 'https://mihaicristiancondrea.github.io/material-next-web-components/',
    icon: 'web',
    image: 'asset:launcher/material-next.svg',
    product: 'material-next',
  }),
  launcherItem({
    kind: 'shortcut',
    key: 'google-play',
    title: 'Google Play',
    href: 'https://play.google.com/store/apps',
    icon: 'shop',
    image: 'asset:launcher/google-play.svg',
  }),
  launcherItem({
    kind: 'shortcut',
    key: 'github',
    title: 'GitHub',
    href: 'https://github.com/',
    icon: 'code',
    image: 'asset:launcher/github.svg',
    monochrome: true,
  }),
  launcherItem({
    kind: 'console',
    key: 'play-console',
    title: 'Play Console',
    href: 'https://play.google.com/console/',
    icon: 'shop',
    image: 'asset:launcher/play-console.svg',
  }),
  launcherItem({
    kind: 'console',
    key: 'firebase',
    title: 'Firebase',
    href: 'https://console.firebase.google.com/',
    icon: 'local_fire_department',
    image: 'asset:launcher/firebase.svg',
  }),
  launcherItem({
    kind: 'console',
    key: 'admob',
    title: 'AdMob',
    href: 'https://admob.google.com/',
    icon: 'ads_click',
    image: 'asset:launcher/admob.svg',
  }),
  launcherItem({
    kind: 'console',
    key: 'cloudflare',
    title: 'Cloudflare',
    href: 'https://dash.cloudflare.com/',
    icon: 'cloud',
    image: 'asset:launcher/cloudflare.svg',
  }),
];

export const DEFAULT_LAUNCHER_CATALOG = createLauncherCatalog({
  items: DEFAULT_LAUNCHER_ITEMS,
  defaultFavorites: [
    'web:material-next',
    'shortcut:google-play',
    'shortcut:github',
  ],
  redirects: [
    'console:play-console',
    'console:firebase',
    'console:admob',
    'console:cloudflare',
  ],
});
