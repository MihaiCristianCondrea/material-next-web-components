---
tags: reference
name: Marketing top app bar
description: An identity-only app bar with the product icon and name.
category: marketing
icon: web_asset
status: experimental
tagName: mnw-marketing-top-app-bar
importPath: material-next-web-components/marketing.js
order: 130
---

## Overview

`<mnw-marketing-top-app-bar>` is a 64dp identity bar with the app icon and name
linking home. It contains no GitHub action, context label or trailing actions.
The full marketing shell uses the shared app shell instead, with a connected or
closed navigation drawer and the same clean product heading.

## Live demo

{% preview "marketing-top-app-bar" "Only the product icon and name." "hub-tokens demo__stage--column" %}

```html
<mnw-marketing-top-app-bar
  name="Pocket Notes"
  icon="/logos/icon.svg"
  href="./"
></mnw-marketing-top-app-bar>
```

## API

{% api "mnw-marketing-top-app-bar" %}

`scrolled` follows the window's scroll position. The bar uses a raised surface
once content scrolls beneath it. The brand is an accessible link; its icon is decorative.
