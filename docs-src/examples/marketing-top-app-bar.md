---
tags: reference
name: Marketing top app bar
description: The hub's Material 3 small top app bar, with the app's icon and name and trailing actions.
category: marketing
icon: web_asset
status: experimental
tagName: mnw-marketing-top-app-bar
importPath: material-next-web-components/marketing.js
order: 130
---

## Overview

`<mnw-marketing-top-app-bar>` is a 64dp Material 3 small top app bar: the app's icon and name linking home, an optional muted context label ("UI kit"), and a `trailing` slot for actions. It is sticky, and takes the raised surface tone once the window scrolls. The marketing shell includes one.

## Live demo

{% preview "marketing-top-app-bar" "This page is scrolled, so the bar shows its scrolled tone." "hub-tokens demo__stage--column" %}

```html
<mnw-marketing-top-app-bar name="Pocket Notes" icon="/logos/icon.svg" context="UI kit" href="./">
  <mnw-github-badge slot="trailing" compact href="https://github.com/example/pocket-notes"></mnw-github-badge>
</mnw-marketing-top-app-bar>
```

## API

{% api "mnw-marketing-top-app-bar" %}

`scrolled` is set by the element from `window.scrollY` (more than 4px) on every scroll. Setting it yourself lasts until the next scroll event.

## Accessibility

- The bar is a `<header>`. The brand link's text is the app's name; the icon is decorative.
- The context label is hidden below 600px.

## Limitations

- It watches the window's scroll, not a scrolling container's.
