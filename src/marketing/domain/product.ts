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
  /** Google Play listing. Shown as a footer link. */
  storeUrl?: string;
  /** Source repository. Shown as a footer link. */
  repositoryUrl?: string;
  /** Privacy policy URL shown in the drawer footer. */
  privacyUrl?: string;
  /** Code of conduct URL shown in the drawer footer. */
  codeOfConductUrl?: string;
  /** Extra links for the footer, in order. */
  links?: ProductLink[];
  /** App version shown in the footer. */
  version?: string;
  /** Credit line in the footer, for example the developer's name. */
  credit?: string;
}

export interface ProductLink {
  label: string;
  href: string;
  /** Material Symbols name. */
  icon?: string;
}

/** Fills the optional fields so the UI never has to guess. */
export const normalizeProduct = (
  product: MarketingProduct
): Required<Omit<MarketingProduct, 'storeUrl' | 'repositoryUrl'>> &
  Pick<MarketingProduct, 'storeUrl' | 'repositoryUrl'> => ({
  privacyUrl: '',
  codeOfConductUrl: '',
  links: [],
  version: '',
  credit: '',
  ...product,
});
