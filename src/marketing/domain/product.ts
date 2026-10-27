/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * The app a marketing hub presents. Every hub keeps one of these in
 * `marketing/ui/src/config/product.js`; the shell, the badges and the
 * prototype page read nothing else about the app.
 */
export interface MarketingProduct {
  /** Stable id, used to namespace stored preview settings. */
  id: string;
  /** The app's name as the store lists it. */
  name: string;
  /** Square app icon (SVG or PNG), relative to the hub's public folder. */
  icon: string;
  /** Privacy policy URL shown in the drawer footer. */
  privacyUrl?: string;
  /** Code of conduct URL shown in the drawer footer. */
  codeOfConductUrl?: string;
}

/** Fills optional legal links for the drawer footer. */
export const normalizeProduct = (
  product: MarketingProduct
): Required<MarketingProduct> => ({
  privacyUrl: '',
  codeOfConductUrl: '',
  ...product,
});
