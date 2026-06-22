---
layout: example.11ty.cjs
title: material-next-web-components ⌲ Examples ⌲ Expressive tab bar
tags: example
name: Expressive tab bar
description: Rounded Material Web tabs for app, article, and docs navigation
icon: tab
order: 1
---

Use `<md-expressive-tab-bar>` or the alias `<mnw-expressive-tab-bar>` when a page needs prominent rounded navigation while still using Material Web tabs internally.

## Live demo

<div class="demo-panel">
  <md-expressive-tab-bar active-index="1"></md-expressive-tab-bar>
  <md-expressive-tab-bar icon-position="end" active-index="2"></md-expressive-tab-bar>
</div>

## Code

<mnw-code-block language="html" copy code='<md-expressive-tab-bar active-index="1"></md-expressive-tab-bar>
<md-expressive-tab-bar icon-position="end" active-index="2"></md-expressive-tab-bar>'></mnw-code-block>

## API

| Property        | Type                                    | Default          | Description                                                |
| --------------- | --------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `active-index`  | `number`                                | `0`              | Selects the active tab by index.                           |
| `icon-position` | `'top' \| 'bottom' \| 'start' \| 'end'` | `'top'`          | Places icons around labels.                                |
| `tabs`          | `DocsNavigationItem[]`                  | example items    | JavaScript-only item data for custom tab labels and links. |
| `aria-label`    | `string`                                | `'Article tabs'` | Accessible label for the navigation landmark.              |

## Slots

| Slot | Description                                 |
| ---- | ------------------------------------------- |
| none | Tabs are rendered from the `tabs` property. |

## Events

| Event      | Description                                      |
| ---------- | ------------------------------------------------ |
| `change`   | Fired when the selected tab changes.             |
| `navigate` | Cancelable event fired before anchor navigation. |

## Accessibility notes

- Use clear tab labels that describe the destination.
- Keep the active tab synchronized with the current page or hash.
- Preserve native link fallback when intercepting `navigate`.

## Design notes

- Use the default top icon layout for expressive docs surfaces.
- Use `start` or `end` icons when horizontal space is tighter.
- Keep the bar near page or app navigation, not inside dense forms.
