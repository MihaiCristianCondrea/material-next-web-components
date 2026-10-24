/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/outlined-button.js';
import '../../app-showcase.js';
import type {MaterialNextAppShowcase} from '../../app-showcase.js';

export default (root: HTMLElement) => {
  const showcase =
    root.querySelector<MaterialNextAppShowcase>('mnw-app-showcase')!;
  for (const button of root.querySelectorAll<HTMLElement>('[data-limit]')) {
    // Changing limit re-slices the loaded apps; it does not fetch again.
    button.addEventListener('click', () => {
      showcase.limit = Number(button.dataset.limit);
    });
  }
};
