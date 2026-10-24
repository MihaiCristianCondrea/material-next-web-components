/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {ResolvedTheme} from '../domain/preview-settings.js';
import {styles} from './hub-document-styles.js';

let installed = false;

/**
 * Adopts the hub's page styles once and marks the document as a hub. The
 * elements use these tokens, so call this before rendering any of them
 * outside the gallery and prototype controllers (which call it themselves).
 */
export const installHubStyles = (doc: Document = document) => {
  doc.documentElement.dataset.mnwHub = '';
  if (installed || !styles.styleSheet) return;
  doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, styles.styleSheet];
  installed = true;
};

/** Sets the hub chrome's theme. App screens keep their own. */
export const setHubTheme = (theme: ResolvedTheme, doc: Document = document) => {
  doc.documentElement.dataset.mnwHubTheme = theme;
};
