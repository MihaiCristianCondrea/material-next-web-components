/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {createLauncherCatalog} from '../domain/launcher-catalog.js';
import {launcherItem} from '../domain/launcher-item.js';

/**
 * Mihai-Cristian Condrea's products and the consoles they run on: the
 * catalog <mnw-product-launcher> uses unless it is given another. The
 * admin redirects match the admin launcher of
 * android-apps-metadata-backend, and its stored ids migrate.
 */

const DEVELOPER_PLAY =
  'https://play.google.com/store/apps/dev?id=5390214922640123642';

export const PROJECT_LAUNCHER_ITEMS = [
  launcherItem({
    kind: 'console',
    key: 'tutorials-admin',
    title: 'Android Insider Admin Console',
    href: 'https://android-insider-backend.mihaicristiancondrea.workers.dev/admin/',
    icon: 'admin_panel_settings',
    image: 'asset:launcher/android-insider.svg',
    product: 'android-insider-admin',
  }),
  launcherItem({
    kind: 'shortcut',
    key: 'github',
    title: 'GitHub profile',
    href: 'https://github.com/MihaiCristianCondrea',
    icon: 'code',
    image: 'asset:launcher/github.svg',
    monochrome: true,
  }),
  launcherItem({
    kind: 'shortcut',
    key: 'google-play',
    title: 'Google Play',
    subtitle: 'Apps by Mihai-Cristian Condrea',
    href: DEVELOPER_PLAY,
    icon: 'shop',
    image: 'asset:launcher/google-play.svg',
  }),
  launcherItem({
    kind: 'web',
    key: 'material-next',
    title: 'Material Next',
    subtitle: 'Web components',
    href: 'https://mihaicristiancondrea.github.io/material-next-web-components/',
    icon: 'web',
    image: 'asset:launcher/material-next.svg',
    product: 'material-next',
  }),
  launcherItem({
    kind: 'web',
    key: 'app-toolkit',
    title: 'App Toolkit',
    subtitle: 'Android library',
    href: 'https://github.com/MihaiCristianCondrea/App-Toolkit-for-Android',
    icon: 'widgets',
    product: 'app-toolkit',
  }),
  launcherItem({
    kind: 'console',
    key: 'apps-metadata',
    title: 'Apps metadata',
    subtitle: 'Admin console',
    href: 'https://android-apps-metadata-backend.mihaicristiancondrea.workers.dev/admin',
    icon: 'dataset',
    product: 'apps-metadata',
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
    href: 'https://admob.google.com/v2/home',
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

export const PROJECT_LAUNCHER_CATALOG = createLauncherCatalog({
  items: PROJECT_LAUNCHER_ITEMS,
  defaultFavorites: [
    'console:tutorials-admin',
    'shortcut:github',
    'shortcut:google-play',
    'web:material-next',
  ],
  redirects: [
    'console:play-console',
    'console:firebase',
    'console:admob',
    'console:cloudflare',
  ],
});

const LEGACY_IDS: Record<string, string> = {
  'tutorials-admin': 'console:tutorials-admin',
  'github-profile': 'shortcut:github',
  'android-app:android-insider': 'shortcut:google-play',
  'play-console': 'console:play-console',
  'firebase-console': 'console:firebase',
  admob: 'console:admob',
  cloudflare: 'console:cloudflare',
};

/** Maps the backend launcher's ids (`github-profile`) to this catalog's. */
export const migrateLegacyLauncherId = (id: string) => LEGACY_IDS[id];
