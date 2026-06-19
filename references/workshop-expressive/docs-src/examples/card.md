---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Cards
tags: example
name: Cards
description: ws-card surfaces for grouped content
order: 7
---

<p>Cards group related content and actions on a consistent elevated surface.</p>

## Live demo

<div class="demo-panel card-grid component-demo">
  <ws-card>
    <h3>Project health</h3>
    <p>Use cards to group related content on a consistent surface.</p>
  </ws-card>
  <ws-card>
    <h3>Token ready</h3>
    <p>Cards automatically inherit the active light or dark theme tokens.</p>
  </ws-card>
</div>

## Code

```html
<ws-card>
  <h3>Project health</h3>
  <p>Use cards to group related content on a consistent surface.</p>
</ws-card>
```

## API

<p>`ws-card` is a lightweight surface component. Configure its appearance with design tokens and CSS custom properties.</p>

## Slots

| Slot    | Description   |
| ------- | ------------- |
| default | Card content. |

## Events

<p>`ws-card` does not dispatch custom events.</p>

## Accessibility notes

- Use semantic headings inside cards when the card introduces a distinct content group.
- Do not make a whole card clickable unless the entire surface has a single, clear destination.

## Design notes

- Keep card content focused on one topic.
- Prefer consistent spacing between cards in a grid or list.
