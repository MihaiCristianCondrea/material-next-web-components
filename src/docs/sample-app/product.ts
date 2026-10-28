/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {defineProductIdentity} from '../../marketing/index.js';

/** Pocket Notes is the documentation sample, not a real product: its whole identity, declared once. */
export const IDENTITY = defineProductIdentity({
  id: 'pocket-notes-sample',
  name: 'Pocket Notes',
  // The bundles sit at the site root, next to demos/.
  icons: {
    app: new URL('./demos/assets/pocket-notes-icon.svg', import.meta.url).href,
  },
  // The palettes are defined in pocket-notes.css.
  colors: {palettes: ['ocean', 'clay']},
  destinations: {
    tabs: [
      {id: 'notes', label: 'Notes', icon: 'sticky_note_2'},
      {id: 'focus', label: 'Focus', icon: 'timer'},
    ],
  },
  links: {
    privacy: 'https://mihaicristiancondrea.github.io/profile/#privacy-policy',
    codeOfConduct:
      'https://mihaicristiancondrea.github.io/profile/#code-of-conduct',
  },
});

/** What the hub reads: the name, the icon and the legal links. */
export const PRODUCT = IDENTITY.product;
export const PALETTES = IDENTITY.palettes;
