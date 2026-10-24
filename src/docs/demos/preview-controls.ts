/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {DEFAULT_PREVIEW_SETTINGS} from '../../marketing/index.js';
import type {MaterialNextPreviewControls} from '../../marketing/index.js';

export default (root: HTMLElement) => {
  const controls = root.querySelector<MaterialNextPreviewControls>(
    'mnw-preview-controls'
  )!;
  const log = root.querySelector('.demo-log')!;
  controls.palettes = ['ocean', 'clay'];
  controls.defaults = DEFAULT_PREVIEW_SETTINGS;
  controls.settings = DEFAULT_PREVIEW_SETTINGS;
  log.textContent = JSON.stringify(controls.settings);
  // Controlled: the element reports a choice, the page owns the settings.
  controls.addEventListener('settings-change', (event) => {
    controls.settings = event.detail;
    log.textContent = `settings-change ${JSON.stringify(event.detail)}`;
  });
};
