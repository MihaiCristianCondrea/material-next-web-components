/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {IdentityFont, ProductIdentity} from '../domain/identity.js';

/**
 * Sets the identity's typefaces on an element (the document by default) as
 * `--md-ref-typeface-brand` and `--md-ref-typeface-plain`, which Material Web, the Android preview
 * and the app's own type scale read.
 */
export const applyProductTypefaces = (
  identity: ProductIdentity,
  el: HTMLElement = document.documentElement
) => {
  el.style.setProperty('--md-ref-typeface-brand', identity.typefaces.brand);
  el.style.setProperty('--md-ref-typeface-plain', identity.typefaces.plain);
};

const register = async (identity: ProductIdentity, font: IdentityFont) => {
  if (!font.src) return;
  // Once per family, whichever asset base registered it first.
  if (
    [...document.fonts].some((f) => f.family.replace(/"/g, '') === font.family)
  )
    return;
  const descriptors: FontFaceDescriptors = {display: 'block'};
  if (font.weight) descriptors.weight = font.weight;
  if (font.stretch) descriptors.stretch = font.stretch;
  if (font.style) descriptors.style = font.style;
  const face = new FontFace(
    font.family,
    `url(${identity.asset(font.src)}) format("${font.format ?? 'truetype'}")`,
    descriptors
  );
  document.fonts.add(await face.load());
};

/**
 * Registers the identity's fonts from its current asset base, applies its typefaces to the
 * document, and waits for the icon fonts, so a capture never draws a fallback face or an icon's
 * name. Call it once the host has set the asset base.
 */
export const loadProductFonts = async (identity: ProductIdentity) => {
  const {brand, plain, symbols} = identity.config.fonts ?? {};
  applyProductTypefaces(identity);
  await Promise.all(
    [brand, plain]
      .filter(
        (f, i, all): f is IdentityFont => Boolean(f) && all.indexOf(f) === i
      )
      .map((f) => register(identity, f))
  );
  await Promise.all(
    (symbols ?? ['Material Symbols Outlined']).map((family) =>
      document.fonts.load(`24px "${family}"`, 'home')
    )
  );
};
