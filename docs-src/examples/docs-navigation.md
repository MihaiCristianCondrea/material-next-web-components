---
tags: reference
name: Docs navigation
description: A vertical list of documentation sections and an "On this page" table of contents, with cancelable navigation events.
category: layout
icon: menu_book
status: internal
tagName: [mnw-docs-vertical-tabs, mnw-docs-table-of-contents]
importPath: [material-next-web-components/docs-vertical-tabs.js, material-next-web-components/docs-table-of-contents.js]
order: 210
---

## Overview

- `<mnw-docs-vertical-tabs>` lists sections or pages as Material Web link list items, with optional icons and a heading. This site's catalog on the left is one per group.
- `<mnw-docs-table-of-contents>` lists the headings of the current page as plain links, with the current one marked. This site's "On this page" column is one.

Both take the same items, `{label: string, href: string, icon?: string}`, and are **internal candidates**: exported and used here, but their API may change before 1.0.

## Live demo

{% demo "docs-navigation" "The vertical tabs get their items from JavaScript, the table of contents from items-json. Both cancel navigate." %}

## Items: property or attribute

- **`items`** is the JavaScript property. Use it from code.
- **`items-json`** is a JSON string attribute, for HTML rendered on a server or by a static site generator, as this site does. Entries without a string `label` and `href` are dropped; invalid JSON leaves the current items.

Both defaults are placeholder links (to `#` anchors), so always set one of them.

## Selection and events

A click makes the item active (`activeIndex`, and `aria-current="page"` on it) and fires `navigate` with `{index, item}`. The event bubbles out of the shadow root and is cancelable: call `preventDefault()` to stop the browser following the link and route in JavaScript. When you route yourself, also set `activeIndex` for changes that do not come from a click, such as Back or scrolling; this site's script does that for the table of contents.

## API

{% api "mnw-docs-vertical-tabs" "mnw-docs-table-of-contents" %}

## Accessibility

- Each renders a `<nav>` named by `aria-label`. Give them distinct names when several are on a page, as this site does per catalog group.
- The current item has `aria-current="page"`.
- Children you put inside the element are not shown once it renders; this site puts plain links there, which show before JavaScript runs and without it.

## Limitations

- Internal candidates: no compatibility promise before 1.0.
- One level of items: there is no nesting or expand and collapse.
