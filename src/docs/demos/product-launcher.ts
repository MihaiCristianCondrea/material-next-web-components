/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {createLauncherCatalog} from '../../launcher/index.js';
import type {MaterialNextProductLauncher} from '../../launcher/index.js';

// A catalog of your own: an app, its site, its console and two shortcuts.
// Pocket Notes' app and site share a product, so on Pocket Notes' pages
// (current-product="pocket-notes") neither is offered.
const catalog = createLauncherCatalog({
  items: [
    {
      kind: 'android-app',
      key: 'pocket-notes',
      title: 'Pocket Notes',
      subtitle: 'Android app',
      href: 'https://play.google.com/store/apps/details?id=com.example.pocketnotes',
      icon: 'sticky_note_2',
      product: 'pocket-notes',
    },
    {
      kind: 'web',
      key: 'pocket-notes',
      title: 'Pocket Notes site',
      href: 'https://example.com/pocket-notes/',
      icon: 'public',
      product: 'pocket-notes',
    },
    {
      kind: 'shortcut',
      key: 'issues',
      title: 'Issues',
      href: 'https://github.com/MihaiCristianCondrea/material-next-web-components/issues',
      icon: 'bug_report',
    },
    // A duplicate URL: dropped, the first entry wins.
    {
      kind: 'shortcut',
      key: 'issues-again',
      title: 'Issues (again)',
      href: 'https://github.com/MihaiCristianCondrea/material-next-web-components/issues/',
    },
    {
      kind: 'console',
      key: 'play-console',
      title: 'Play Console',
      href: 'https://play.google.com/console/',
      image: 'asset:launcher/play-console.svg',
    },
    {
      kind: 'console',
      key: 'firebase',
      title: 'Firebase',
      href: 'https://console.firebase.google.com/',
      image: 'asset:launcher/firebase.svg',
    },
  ],
  defaultFavorites: ['android-app:pocket-notes', 'shortcut:issues'],
  redirects: ['console:play-console', 'console:firebase'],
});

export default (root: HTMLElement) => {
  const custom =
    root.querySelector<MaterialNextProductLauncher>('#custom-launcher')!;
  const log = root.querySelector('.demo-log')!;
  custom.catalog = catalog;
  const onChange = (event: Event) => {
    const {favoriteIds} = (event as CustomEvent<{favoriteIds: string[]}>)
      .detail;
    log.textContent = `launcher-change ${JSON.stringify(favoriteIds)}`;
  };
  const onToggle = (event: Event) => {
    const {open} = (event as CustomEvent<{open: boolean}>).detail;
    log.textContent = `launcher-toggle {"open":${open}}`;
  };
  root.addEventListener('launcher-change', onChange);
  root.addEventListener('launcher-toggle', onToggle);
  log.textContent = 'Open a launcher: the apps button on the right.';
  return () => {
    root.removeEventListener('launcher-change', onChange);
    root.removeEventListener('launcher-toggle', onToggle);
    root.querySelectorAll('mnw-product-launcher').forEach((l) => l.close());
  };
};
