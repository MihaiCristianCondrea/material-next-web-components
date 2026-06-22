/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

export interface DocsNavigationItem {
  label: string;
  icon?: string;
  href: string;
}

export const appNavigationItems: DocsNavigationItem[] = [
  {label: 'Home', icon: 'home', href: '#home'},
  {label: 'Examples', icon: 'widgets', href: '#examples'},
];

export const exampleNavigationItems: DocsNavigationItem[] = [
  {label: 'Expressive tab bar', icon: 'tab', href: '#expressive-tab-bar'},
  {label: 'App showcase', icon: 'apps', href: '#app-showcase'},
  {label: 'Code block', icon: 'code', href: '#code-block'},
];

export const exampleTableOfContentsItems: DocsNavigationItem[] = [
  {label: 'Overview', href: '#examples-overview'},
  {label: 'Expressive tab bar', href: '#expressive-tab-bar'},
  {label: 'App showcase', href: '#app-showcase'},
  {label: 'Code block', href: '#code-block'},
];
