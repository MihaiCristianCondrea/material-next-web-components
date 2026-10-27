---
tags: reference
name: Marketing top app bar
description: A 64dp app bar with the product icon and name, and trailing actions.
category: marketing
icon: web_asset
status: experimental
tagName: mnw-marketing-top-app-bar
importPath: material-next-web-components/marketing.js
order: 130
---

## Overview

`<mnw-marketing-top-app-bar>` is a 64dp bar with the app icon and name linking
home. Its `actions` slot holds trailing actions: icon buttons, buttons, links or
any custom element, such as `<mnw-product-launcher>`. The full marketing shell
uses the shared app shell instead, with a connected or closed navigation drawer,
the same product heading and the same `actions` slot.

## Live demo

{% preview "marketing-top-app-bar" "The product icon and name, with an icon button and a button as trailing actions." "hub-tokens demo__stage--column" %}

```html
<mnw-marketing-top-app-bar name="Pocket Notes" icon="/logos/icon.svg" href="./">
  <md-icon-button
    slot="actions"
    href="https://github.com/example/notes"
    aria-label="Source"
  >
    <md-icon>code</md-icon>
  </md-icon-button>
  <md-filled-tonal-button slot="actions" href="https://play.google.com/">
    Get the app
  </md-filled-tonal-button>
</mnw-marketing-top-app-bar>
```

Actions keep reading order and are spaced 8px apart. Give icon-only actions an
`aria-label`.

## API

{% api "mnw-marketing-top-app-bar" %}

`scrolled` follows the window's scroll position. The bar uses a raised surface
once content scrolls beneath it. The brand is an accessible link; its icon is decorative.
