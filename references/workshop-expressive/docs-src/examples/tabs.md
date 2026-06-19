---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Tabs
tags: example
name: Tabs
description: ws-tabs and ws-tab navigation
order: 6
---

<p>Tabs switch between related sections at the same level of hierarchy while the active indicator animates between selections.</p>

## Live demo

<div class="demo-panel component-demo tabs-demo-grid">
  <div>
    <h3>Horizontal</h3>
    <ws-tabs aria-label="Demo sections">
      <ws-tab selected href="#overview">
        <i slot="icon" class="ri-home-5-line" aria-hidden="true"></i>
        Overview
      </ws-tab>
      <ws-tab href="#components">Components</ws-tab>
      <ws-tab href="#settings">Settings</ws-tab>
    </ws-tabs>
  </div>

  <div>
    <h3>Vertical</h3>
    <ws-tabs orientation="vertical" aria-label="Vertical demo sections">
      <ws-tab selected href="#tab-foundation">Foundation</ws-tab>
      <ws-tab href="#tab-components">Components</ws-tab>
      <ws-tab href="#tab-patterns">Patterns</ws-tab>
    </ws-tabs>
  </div>
</div>

## Code

```html
<ws-tabs aria-label="Demo sections">
  <ws-tab selected href="#overview">
    <i slot="icon" class="ri-home-5-line" aria-hidden="true"></i>
    Overview
  </ws-tab>
  <ws-tab href="#components">Components</ws-tab>
  <ws-tab href="#settings">Settings</ws-tab>
</ws-tabs>

<ws-tabs orientation="vertical" aria-label="Vertical demo sections">
  <ws-tab selected href="#tab-foundation">Foundation</ws-tab>
  <ws-tab href="#tab-components">Components</ws-tab>
  <ws-tab href="#tab-patterns">Patterns</ws-tab>
</ws-tabs>
```

## API

| Element   | Property                | Type                         | Default        | Description                                   |
| --------- | ----------------------- | ---------------------------- | -------------- | --------------------------------------------- |
| `ws-tabs` | `orientation`           | `'horizontal' \| 'vertical'` | `'horizontal'` | Sets layout and `aria-orientation`.           |
| `ws-tabs` | `aria-label`            | `string`                     | —              | Accessible label for the tab list.            |
| `ws-tab`  | `href`                  | `string`                     | `'#'`          | Link destination.                             |
| `ws-tab`  | `selected`              | `boolean`                    | `false`        | Marks the active tab.                         |
| `ws-tab`  | `current-when-selected` | `string`                     | `'page'`       | `aria-current` value forwarded when selected. |

## Slots

| Element   | Slot    | Description                    |
| --------- | ------- | ------------------------------ |
| `ws-tabs` | default | One or more `ws-tab` elements. |
| `ws-tab`  | default | Tab label.                     |
| `ws-tab`  | `icon`  | Optional leading icon.         |

## Events

| Event           | Detail          | Description                               |
| --------------- | --------------- | ----------------------------------------- |
| `ws-tab-change` | `{ tab, href }` | Fired when a tab is clicked and selected. |

## Motion and navigation

- The active indicator animates whenever the selected tab changes after the first render, including changes made by app state, router updates, or direct `selected` property changes.
- Hash links such as `#overview` stay on the current page, so `ws-tabs` can update selection immediately.
- Full-page docs navigation keeps normal anchor semantics and adds a tiny progressive enhancement: same-origin docs tabs prefetch likely destinations and wait for the shared tab motion duration before navigating, so users see the same smooth selection feedback as the live demo.
- Customize tab motion with the shared `--ws-motion-*` custom properties; tabs also honor `prefers-reduced-motion`.

## Accessibility notes

- Provide an `aria-label` that describes the tab group.
- Keep each tab label unique within the group.
- Use tabs for peer sections, not for unrelated navigation destinations.

## Design notes

- Horizontal tabs work best for compact sets of two to five items.
- Vertical tabs can support longer labels and side navigation patterns.
