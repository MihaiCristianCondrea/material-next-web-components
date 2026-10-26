/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Material Next launcher: an apps button that opens a visitor's favorite
 * products, consoles and shortcuts, for every product page and admin console.
 *
 *   domain/   what an entry is, which ones a page shows, favorite edits: pure
 *   data/     where favorites persist (localStorage, versioned)
 *   catalog/  Mihai-Cristian Condrea's projects, the default catalog
 *   ui/       <mnw-product-launcher>
 */

export * from './domain/launcher-item.js';
export * from './domain/launcher-catalog.js';
export * from './domain/launcher-favorites.js';

export * from './data/launcher-preference-store.js';

export * from './catalog/projects.js';

export * from './ui/product-launcher.js';
