/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

export interface DocsNavigationItem {
  label: string;
  icon?: string;
  href: string;
}

export function toDocsNavigationItems(value: unknown): DocsNavigationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as {label?: unknown}).label !== 'string' ||
      typeof (item as {href?: unknown}).href !== 'string'
    ) {
      return [];
    }

    const {label, href, icon} = item as {
      label: string;
      href: string;
      icon?: unknown;
    };
    return [
      {
        label,
        href,
        ...(typeof icon === 'string' ? {icon} : {}),
      },
    ];
  });
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
