/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/slider/slider.js';
import {createMarketingEmbed} from '../../marketing/index.js';
import {SCREENS} from '../sample-app/screens.js';

const FPS = 30;
const {mount} = createMarketingEmbed({screens: SCREENS});

/** The state for one video frame: a function of the frame number only. */
const focusAt = (frame: number) => ({
  minutes: 1,
  elapsed: frame / FPS,
  running: false,
});

export default (root: HTMLElement) => {
  const target = root.querySelector<HTMLElement>('.embed-target')!;
  const slider = root.querySelector<HTMLInputElement>('md-slider')!;
  const log = root.querySelector('.demo-log')!;
  const draw = async () => {
    const frame = Number(slider.value);
    const state = focusAt(frame);
    // mount() resolves once every element has rendered: capture right after.
    await mount(target, 'focus', state, {palette: 'captured'});
    log.textContent = `frame ${frame}\nmount(el, 'focus', ${JSON.stringify(state)})`;
  };
  slider.addEventListener('input', draw);
  void draw();
};
