/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {colorThemeCss} from '../domain/color-theme.js';
import type {ThemePreference} from '../data/theme-preference-store.js';

const STYLE_ATTRIBUTE = 'data-mnw-color-theme';

/**
 * Applies a theme to a document: the generated roles in one `<style>` at the
 * end of `<head>`, so they win over the page's own tokens, and
 * `data-color-mode` on the root element (`light`, `dark` or `system`) for
 * page styles that need it. Without `sourceColor` the style is removed and
 * the page's own colors show; `color-scheme` still follows the mode.
 */
export const applyColorTheme = (
  {sourceColor, mode, variant}: ThemePreference,
  {document: doc = globalThis.document}: {document?: Document} = {}
) => {
  if (!doc) return;
  const root = doc.documentElement;
  root.dataset.colorMode = mode;
  root.style.colorScheme = mode === 'system' ? 'light dark' : mode;
  let style = doc.head.querySelector<HTMLStyleElement>(
    `style[${STYLE_ATTRIBUTE}]`
  );
  if (!sourceColor) {
    style?.remove();
    return;
  }
  if (!style) {
    style = doc.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE, '');
  }
  // As specific as a page's own `:root[data-color-mode]` rules, and later.
  style.textContent = colorThemeCss(
    {sourceColor, mode, variant},
    ':root[data-color-mode]'
  );
  // Last in <head>, after any stylesheet added since the previous call.
  doc.head.append(style);
};
