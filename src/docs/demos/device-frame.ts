/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {createMarketingEmbed} from '../../marketing/index.js';
import type {MaterialNextDeviceFrame} from '../../marketing/index.js';
import {SCREENS} from '../sample-app/screens.js';

const embed = createMarketingEmbed({screens: SCREENS});

export default (root: HTMLElement) => {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  for (const frame of root.querySelectorAll<MaterialNextDeviceFrame>(
    'mnw-device-frame'
  )) {
    frame.tone = dark ? 'dark' : 'light';
    const screen = frame.querySelector<HTMLElement>('[data-window]')!;
    // Each window lays the app out for its size: bottom bar, rail, desktop.
    void embed.mount(
      screen,
      'notes',
      {},
      {window: screen.dataset.window, palette: 'captured'}
    );
  }
};
