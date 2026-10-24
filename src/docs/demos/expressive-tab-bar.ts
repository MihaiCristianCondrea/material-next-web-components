/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '../../expressive-tab-bar.js';
import type {MaterialNextExpressiveTabBar} from '../../expressive-tab-bar.js';

const tabs = [
  {label: 'Overview', icon: 'article', href: '#overview'},
  {label: 'Usage', icon: 'code', href: '#usage'},
  {label: 'Accessibility', icon: 'accessibility_new', href: '#accessibility'},
];

export default (root: HTMLElement) => {
  const log = root.querySelector('.demo-log')!;
  for (const bar of root.querySelectorAll<MaterialNextExpressiveTabBar>(
    'mnw-expressive-tab-bar'
  )) {
    // Objects go through the JavaScript property; there is no attribute for them.
    bar.tabs = tabs;
    bar.addEventListener('change', (event) => {
      const {activeIndex, item} = (event as CustomEvent).detail;
      log.textContent = `change: activeIndex ${activeIndex} (${item.label})`;
    });
    bar.addEventListener('navigate', (event) => {
      // Cancel to route in JavaScript instead of following the link.
      event.preventDefault();
      log.textContent += `\nnavigate: ${(event as CustomEvent).detail.item.href} (canceled)`;
    });
  }
};
