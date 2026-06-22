---
layout: example.11ty.cjs
title: material-next-web-components ⌲ Examples ⌲ Docs navigation
tags: example
name: Docs navigation
description: Material vertical navigation and table-of-contents components
icon: menu_book
order: 5
---

Use `<mnw-docs-vertical-tabs>` and `<mnw-docs-table-of-contents>` to separate examples navigation from page-local headings.

## Live demo

<div class="demo-panel navigation-demo">
  <mnw-docs-vertical-tabs></mnw-docs-vertical-tabs>
  <mnw-docs-table-of-contents></mnw-docs-table-of-contents>
</div>

## Code

<mnw-code-block language="html" copy code='<mnw-docs-vertical-tabs></mnw-docs-vertical-tabs>
<mnw-docs-table-of-contents></mnw-docs-table-of-contents>'></mnw-code-block>

## API

| Property       | Type                   | Default            | Description                                    |
| -------------- | ---------------------- | ------------------ | ---------------------------------------------- |
| `heading`      | `string`               | component-specific | Heading shown above the links.                 |
| `active-index` | `number`               | `0`                | Marks the active item.                         |
| `items`        | `DocsNavigationItem[]` | example defaults   | JavaScript-only navigation items.              |
| `items-json`   | `string`               | `''`               | Declarative JSON items for static docs output. |
| `aria-label`   | `string`               | component-specific | Accessible label for the nav landmark.         |

## Slots

| Slot | Description                        |
| ---- | ---------------------------------- |
| none | Links are rendered from item data. |

## Events

| Event      | Description                                         |
| ---------- | --------------------------------------------------- |
| `navigate` | Cancelable event fired when a user selects an item. |

## Accessibility notes

- Use vertical tabs for sibling pages or component lists.
- Use the table of contents for headings inside the current page.
- Keep `aria-current` synchronized after hash and history navigation.

## Design notes

- Place examples navigation on the leading side of wide layouts.
- Place the table of contents on the trailing side.
- Collapse both into normal document flow on narrow screens.
