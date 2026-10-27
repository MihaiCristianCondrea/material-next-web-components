---
tags: reference
name: Expressive tab bar
description: Rounded Material 3 expressive tabs for section navigation, built on Material Web tabs.
category: components
icon: tab
status: experimental
tagName: mnw-expressive-tab-bar
importPath: material-next-web-components/expressive-tab-bar.js
order: 20
---

## Overview

`<mnw-expressive-tab-bar>` is a pill-shaped bar of Material Web primary tabs, with inline icons by default and one full-height selection pill that slides between tabs, matching the Material Design reference. Use it for a few peer sections of one page or article: Overview, Specs, Guidelines, Accessibility. It renders a `<nav>` landmark, and each tab with an `href` holds a real link.

Use plain Material Web `md-tabs` for panels that switch content in place without a URL, and a navigation bar or rail for an app's top-level destinations.

`<md-expressive-tab-bar>` is the same element under its first name. It stays registered as a compatibility alias; new code uses `mnw-expressive-tab-bar`.

## Live demo

{% demo "expressive-tab-bar" "The bar cancels navigate, so the links do not move the page." "demo__stage--column" %}

## Usage

Tabs are objects, so set them through the `tabs` property: `{label: string, href: string, icon?: string}`, where `icon` is a Material Symbols name. The default is three placeholder tabs, so always set it.

Selecting a tab updates `activeIndex` and fires `change`. If the tab has an `href`, `navigate` fires next: cancel it to route in JavaScript, or let the browser follow the link.

```ts
import 'material-next-web-components/expressive-tab-bar.js';

const bar = document.querySelector('mnw-expressive-tab-bar')!;
bar.tabs = [
  {label: 'Overview', icon: 'article', href: '/guide/'},
  {label: 'API', icon: 'code', href: '/guide/api/'},
];
bar.activeIndex = 0;
bar.addEventListener('navigate', (event) => {
  event.preventDefault();
  router.go((event as CustomEvent).detail.item.href);
});
```

## Specs

The track and moving selection are fully rounded. The default height is 80px,
icons are 24px, and icons and labels sit in a single row. The indicator fills the
track's height. Narrow containers scroll horizontally instead of clipping a label.
`icon-position="top"`, `bottom` and `end` remain available when a product needs them.

## API

{% api "mnw-expressive-tab-bar" %}

`icon-position` accepts `top`, `bottom`, `start` and `end`; the default and any other value are treated as `start`. `active-index` is clamped to the tabs that exist. `change` only fires when the index actually changes.

## Guidelines

Use the bar for peer sections such as Overview, Specs, Guidelines and Accessibility.
Use the app shell for application destinations. Selecting a tab moves one shared
pill; it does not draw a separate background on every tab. Reduced motion removes
the pill's travel.

## Accessibility

- The bar is a `<nav>` named by `aria-label` (default "Article tabs"). Give each bar on a page its own name.
- Material Web tabs move between tabs with the arrow keys. A tab with an `href` contains a link, so it can also be opened in a new tab.
- Icons are decorative; the label is always shown.

The bar and selected tab are fully rounded by default (`999px`), including hover and pressed surfaces. Override `--mnw-expressive-tab-bar-shape` for a different shape.

## Limitations

- Experimental: names of the CSS custom properties may change before 1.0.
- There are no tab panels: pair it with routing or anchors.
- Many tabs scroll sideways; keep it to about five.
