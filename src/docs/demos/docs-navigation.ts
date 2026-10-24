/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '../../docs-table-of-contents.js';
import '../../docs-vertical-tabs.js';
import type {MaterialNextDocsVerticalTabs} from '../../docs-vertical-tabs.js';

export default (root: HTMLElement) => {
  const log = root.querySelector('.demo-log')!;
  const tabs = root.querySelector<MaterialNextDocsVerticalTabs>(
    'mnw-docs-vertical-tabs'
  )!;
  // From JavaScript, items is a property; items-json (above) suits server HTML.
  tabs.items = [
    {label: 'Code block', icon: 'code', href: '../code-block/'},
    {label: 'Tab bar', icon: 'tab', href: '../expressive-tab-bar/'},
    {label: 'App showcase', icon: 'apps', href: '../app-showcase/'},
  ];
  root.addEventListener('navigate', (event) => {
    const {index, item} = (event as CustomEvent).detail;
    // A single-page app cancels the link and routes itself.
    event.preventDefault();
    log.textContent = `navigate: index ${index}, ${item.href} (link canceled)`;
  });
};
