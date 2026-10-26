/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Material Next app shell: the frame of an application (a navigation drawer,
 * a top app bar and the screen) for admin consoles and other web apps.
 *
 *   domain/  layout policies and the current destination: pure
 *   ui/      <mnw-app-shell> and <mnw-navigation-item>
 *
 * The shell owns layout, drawer state, focus and motion; the app owns its
 * routes, history and screens.
 */

export * from './domain/layout-policy.js';
export * from './domain/active-destination.js';

export * from './ui/navigation-item.js';
export * from './ui/app-shell.js';
