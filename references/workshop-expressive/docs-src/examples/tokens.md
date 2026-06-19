---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Design tokens
tags: example
name: Design tokens
description: Foundation color and shape tokens
order: 1
---

<p>Foundation tokens are CSS custom properties that keep components visually consistent across light and dark themes.</p>

## Live demo

<div class="demo-panel component-demo">
  <h3>Shape tokens</h3>
  <section class="token-grid" aria-label="Shape tokens">
    <ws-card><div class="shape-swatch" style="--swatch-radius: var(--ws-shape-extra-small, 4px)"></div><strong>extra-small</strong><p><code>--ws-shape-extra-small</code><br>4px</p></ws-card>
    <ws-card><div class="shape-swatch" style="--swatch-radius: var(--ws-shape-small, 6px)"></div><strong>small</strong><p><code>--ws-shape-small</code><br>6px</p></ws-card>
    <ws-card><div class="shape-swatch" style="--swatch-radius: var(--ws-shape-medium, 8px)"></div><strong>medium</strong><p><code>--ws-shape-medium</code><br>8px</p></ws-card>
    <ws-card><div class="shape-swatch" style="--swatch-radius: var(--ws-shape-large, 12px)"></div><strong>large</strong><p><code>--ws-shape-large</code><br>12px</p></ws-card>
    <ws-card><div class="shape-swatch" style="--swatch-radius: var(--ws-shape-extra-large, 16px)"></div><strong>extra-large</strong><p><code>--ws-shape-extra-large</code><br>16px</p></ws-card>
  </section>

  <h3>Color tokens</h3>
  <section class="token-grid" aria-label="Color tokens">
    <ws-card><div class="color-swatch" style="--swatch-color: var(--ws-color-primary, #6c5cff)"></div><strong>primary</strong><p><code>--ws-color-primary</code><br>Brand actions</p></ws-card>
    <ws-card><div class="color-swatch" style="--swatch-color: var(--ws-color-secondary, #3b82f6)"></div><strong>secondary</strong><p><code>--ws-color-secondary</code><br>Supporting actions</p></ws-card>
    <ws-card><div class="color-swatch" style="--swatch-color: var(--ws-color-tertiary, #10b981)"></div><strong>tertiary</strong><p><code>--ws-color-tertiary</code><br>Success accents</p></ws-card>
    <ws-card><div class="color-swatch" style="--swatch-color: var(--ws-color-surface, #ffffff)"></div><strong>surface</strong><p><code>--ws-color-surface</code><br>Cards and panels</p></ws-card>
    <ws-card><div class="color-swatch" style="--swatch-color: var(--ws-color-on-surface, #0f172a)"></div><strong>on-surface</strong><p><code>--ws-color-on-surface</code><br>Primary text</p></ws-card>
  </section>
</div>

## Code

```css
.demo {
  background: var(--ws-color-surface);
  border: 1px solid var(--ws-color-outline-variant);
  border-radius: var(--ws-shape-large);
  color: var(--ws-color-on-surface);
}
```

## API

| Token group | Tokens                                                                               | Use                                                             |
| ----------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Color roles | `--ws-color-primary`, `--ws-color-secondary`, `--ws-color-tertiary`                  | Action and accent color roles.                                  |
| Surfaces    | `--ws-color-background`, `--ws-color-surface`, `--ws-color-surface-variant`          | Page, cards, panels, and subtle containers.                     |
| Content     | `--ws-color-on-background`, `--ws-color-on-surface`, `--ws-color-on-surface-variant` | Text and icon colors placed on matching surfaces.               |
| Shape       | `--ws-shape-extra-small` through `--ws-shape-extra-large`, `--ws-shape-full`         | Radius scale for controls, cards, pills, and focus affordances. |

## Slots

<p>Design tokens are CSS custom properties and do not expose slots.</p>

## Events

<p>Design tokens do not dispatch events.</p>

## Accessibility notes

- Keep foreground tokens paired with compatible background tokens.
- Verify contrast when adding new custom token overrides.

## Design notes

- Prefer semantic roles like `--ws-color-surface` over hard-coded hex values.
- Use the shape scale consistently so components feel like part of the same family.
