---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Drawer navigation
tags: example
name: Drawer navigation
description: ws-drawer header, footer, nested items, badges, progress, disabled, and selection
order: 4
---

<p>Drawers organize durable navigation destinations and can show hierarchy, progress, badges, and disabled destinations.</p>

## Live demo

<div class="demo-panel component-demo drawer-demo-panel">
  <ws-drawer id="example-drawer" selected-item-id="lesson-3">
    <div slot="header" class="drawer-header">
      <strong>Design systems - Learn</strong>
      <span>4 lessons · 2 complete</span>
    </div>

    <ws-drawer-item item-id="learn" title="Design systems - Learn" expanded>
      <i slot="icon" class="ri-graduation-cap-line" aria-hidden="true"></i>
      <ws-drawer-item item-id="chapter-1" title="Chapter 1: Foundations" expanded>
        <ws-drawer-item item-id="lesson-1" title="Lesson 1" subtitle="Tokens and theme" progress="1"></ws-drawer-item>
        <ws-drawer-item item-id="lesson-2" title="Lesson 2" subtitle="Components" progress="1"></ws-drawer-item>
        <ws-drawer-item item-id="lesson-3" title="Lesson 3" subtitle="Patterns" progress="0.35"></ws-drawer-item>
        <ws-drawer-item item-id="lesson-4" title="Lesson 4" subtitle="Accessibility basics" progress="0.8"></ws-drawer-item>
      </ws-drawer-item>
      <ws-drawer-item item-id="chapter-2" title="Chapter 2: Application">
        <ws-drawer-item item-id="lesson-5" title="Lesson 5" subtitle="Production handoff" progress="0.2"></ws-drawer-item>
      </ws-drawer-item>
    </ws-drawer-item>

    <ws-drawer-item item-id="resources" title="Resources" badge="4">
      <i slot="icon" class="ri-book-open-line" aria-hidden="true"></i>
    </ws-drawer-item>
    <ws-drawer-item item-id="locked" title="Assessment" subtitle="Complete chapter 1 first" disabled>
      <i slot="icon" class="ri-lock-line" aria-hidden="true"></i>
    </ws-drawer-item>

    <div slot="footer" class="drawer-footer-note">Course progress updates as lessons are selected.</div>

  </ws-drawer>
</div>

<script type="module">
  const drawer = document.querySelector('#example-drawer');
  drawer?.addEventListener('ws-drawer-item-click', event => {
    drawer.selectedItemId = event.detail.itemId;
  });
</script>

## Code

```html
<ws-drawer selected-item-id="lesson-3">
  <div slot="header" class="drawer-header">
    <strong>Design systems - Learn</strong>
    <span>4 lessons · 2 complete</span>
  </div>

  <ws-drawer-item item-id="learn" title="Design systems - Learn" expanded>
    <i slot="icon" class="ri-graduation-cap-line" aria-hidden="true"></i>
    <ws-drawer-item item-id="chapter-1" title="Chapter 1: Foundations" expanded>
      <ws-drawer-item
        item-id="lesson-1"
        title="Lesson 1"
        subtitle="Tokens and theme"
        progress="1"
      ></ws-drawer-item>
      <ws-drawer-item
        item-id="lesson-2"
        title="Lesson 2"
        subtitle="Components"
        progress="1"
      ></ws-drawer-item>
      <ws-drawer-item
        item-id="lesson-3"
        title="Lesson 3"
        subtitle="Patterns"
        progress="0.35"
      ></ws-drawer-item>
      <ws-drawer-item
        item-id="lesson-4"
        title="Lesson 4"
        subtitle="Accessibility basics"
        progress="0.8"
      ></ws-drawer-item>
    </ws-drawer-item>
    <ws-drawer-item item-id="chapter-2" title="Chapter 2: Application">
      <ws-drawer-item
        item-id="lesson-5"
        title="Lesson 5"
        subtitle="Production handoff"
        progress="0.2"
      ></ws-drawer-item>
    </ws-drawer-item>
  </ws-drawer-item>

  <ws-drawer-item item-id="resources" title="Resources" badge="4">
    <i slot="icon" class="ri-book-open-line" aria-hidden="true"></i>
  </ws-drawer-item>

  <div slot="footer" class="drawer-footer-note">
    Course progress updates as lessons are selected.
  </div>
</ws-drawer>
```

## API

| Element          | Property           | Type      | Default | Description                                                |
| ---------------- | ------------------ | --------- | ------- | ---------------------------------------------------------- |
| `ws-drawer`      | `selected-item-id` | `string`  | —       | Selected leaf item id.                                     |
| `ws-drawer-item` | `item-id`          | `string`  | —       | Stable item identifier returned in events.                 |
| `ws-drawer-item` | `title`            | `string`  | —       | Primary label.                                             |
| `ws-drawer-item` | `subtitle`         | `string`  | —       | Optional supporting label.                                 |
| `ws-drawer-item` | `badge`            | `string`  | —       | Optional count or short status.                            |
| `ws-drawer-item` | `progress`         | `number`  | —       | Progress value from 0 to 1; `1` shows a completion check.  |
| `ws-drawer-item` | `expanded`         | `boolean` | `false` | Shows nested drawer items.                                 |
| `ws-drawer-item` | `selected`         | `boolean` | `false` | Reflects selected state. Usually controlled by the drawer. |
| `ws-drawer-item` | `disabled`         | `boolean` | `false` | Prevents activation.                                       |

## Slots

| Element          | Slot     | Description              |
| ---------------- | -------- | ------------------------ |
| `ws-drawer`      | `header` | Optional top content.    |
| `ws-drawer`      | default  | Drawer items.            |
| `ws-drawer`      | `footer` | Optional bottom content. |
| `ws-drawer-item` | `icon`   | Optional leading icon.   |
| `ws-drawer-item` | default  | Nested drawer items.     |

## Events

| Event                  | Detail             | Description                                      |
| ---------------------- | ------------------ | ------------------------------------------------ |
| `ws-drawer-item-click` | `{ itemId, item }` | Fired by `ws-drawer` when a leaf item activates. |

## Accessibility notes

- Keep navigation labels unique and concise.
- Do not put essential destinations only inside a disabled item.
- Use badges for short status only; place longer explanations in page content.

## Design notes

- Use hierarchy sparingly so the drawer stays scannable.
- Reserve progress for task-like navigation where completion is meaningful.
