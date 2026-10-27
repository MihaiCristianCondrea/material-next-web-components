/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  DEFAULT_SOURCE_COLOR,
  colorScheme,
  type ColorRole,
  type MaterialNextColorPicker,
  type MaterialNextThemeControls,
} from '../../theme/index.js';

const ROLES: ColorRole[] = [
  'primary',
  'primary-container',
  'secondary',
  'secondary-container',
  'tertiary',
  'tertiary-container',
  'surface-container',
  'surface-container-highest',
];

export default (root: HTMLElement) => {
  const controls = root.querySelector<MaterialNextThemeControls>(
    '#demo-theme-controls'
  )!;
  const picker =
    root.querySelector<MaterialNextColorPicker>('#demo-color-picker')!;
  const swatches = root.querySelector<HTMLElement>('.demo-theme__swatches')!;
  const log = root.querySelector<HTMLElement>('.demo-log')!;

  // Controlled: this demo applies nothing to the page and stores nothing;
  // it draws the roles the choice generates.
  const draw = () => {
    const {sourceColor = DEFAULT_SOURCE_COLOR, mode} = controls.preference;
    const dark =
      mode === 'dark' ||
      (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const scheme = colorScheme(sourceColor, {dark});
    swatches.replaceChildren(
      ...ROLES.map((role) => {
        const swatch = document.createElement('span');
        swatch.className = 'demo-theme__swatch';
        swatch.style.background = scheme[role];
        swatch.style.color =
          scheme[`on-${role}` as ColorRole] ?? scheme['on-surface'];
        swatch.textContent = role;
        return swatch;
      })
    );
  };
  controls.addEventListener('color-theme-change', (e) => {
    log.textContent = `color-theme-change ${JSON.stringify(e.detail)}`;
    draw();
  });
  picker.addEventListener('change', () => {
    log.textContent = `color picker change ${picker.value}`;
  });
  draw();
};
