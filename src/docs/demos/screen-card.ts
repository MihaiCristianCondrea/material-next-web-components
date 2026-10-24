/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {ScreenHost, createScreenRegistry} from '../../marketing/index.js';
import type {MaterialNextScreenCard} from '../../marketing/index.js';
import {SCREENS} from '../sample-app/screens.js';

const registry = createScreenRegistry(SCREENS);

export default (root: HTMLElement) => {
  const log = root.querySelector('.demo-log')!;
  const hosts: ScreenHost[] = [];
  for (const card of root.querySelectorAll<MaterialNextScreenCard>(
    'mnw-screen-card'
  )) {
    const el = card.querySelector<HTMLElement>('.card-screen')!;
    // The card is only the frame around the preview: the app's screen renders
    // into the slotted element, here through a ScreenHost.
    const host = new ScreenHost(el, {
      registry,
      id: el.dataset.screen!,
      frame: card.framed,
      fill: !card.framed,
    });
    hosts.push(host);
    card.addEventListener('card-theme-toggle', (event) => {
      card.dark = event.detail.selected;
      host.setOptions({theme: card.dark ? 'dark' : 'light'});
      log.textContent = `card-theme-toggle: ${card.heading} dark = ${card.dark}`;
    });
    card.addEventListener('card-nav-toggle', (event) => {
      card.threeButton = event.detail.selected;
      host.setOptions({navType: card.threeButton ? 'buttons' : 'gesture'});
      log.textContent = `card-nav-toggle: ${card.heading} 3-button = ${card.threeButton}`;
    });
  }
  return () => hosts.forEach((host) => host.destroy());
};
