/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Material Next marketing: a ready-made marketing hub for Android apps built
 * with App Toolkit. The app keeps its screens (Lit templates translated from
 * Compose), its palettes and its product config; this module provides the
 * hub around them.
 *
 *   domain/  what a product, a screen and the preview settings are, and the
 *            App Toolkit window rules: pure, no DOM
 *   data/    where settings persist and how views travel in URLs
 *   ui/      custom elements and Lit templates, Material Web only
 *   hub/     the controllers that assemble them: gallery, prototype, embed
 */

export * from './domain/product.js';
export * from './domain/screen.js';
export * from './domain/preview-settings.js';
export * from './domain/windows.js';

export * from './data/preview-settings-store.js';
export * from './data/prototype-url.js';

export * from './ui/assets.js';
export * from './ui/hub-document.js';
export * from './ui/options.js';
export * from './ui/controls.js';
export * from './ui/badges.js';
export * from './ui/device-frame.js';
export * from './ui/marketing-top-app-bar.js';
export * from './ui/preview-controls.js';
export * from './ui/screen-card.js';
export * from './ui/marketing-shell.js';
export * from './ui/prototype-layout.js';
export * from './ui/screen-inspector.js';

export * from './hub/screen-host.js';
export * from './hub/gallery.js';
export * from './hub/prototype.js';
export * from './hub/embed.js';
