/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  type DocsNavigationItem,
  toDocsNavigationItems,
} from './docs-navigation.js';

export function parseNavigationItemsJson(
  itemsJson: string,
  currentItems: DocsNavigationItem[]
) {
  if (!itemsJson) {
    return currentItems;
  }

  try {
    const items = toDocsNavigationItems(JSON.parse(itemsJson));
    return items.length ? items : currentItems;
  } catch {
    return currentItems;
  }
}

export function createNavigationEvent(index: number, item: DocsNavigationItem) {
  return new CustomEvent('navigate', {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: {index, item},
  });
}
