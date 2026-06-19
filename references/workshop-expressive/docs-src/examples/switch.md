---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Switch
tags: example
name: Switch
description: ws-switch binary controls with optional icons
order: 3
---

<p>Switches toggle a binary setting on or off and should reflect the saved state immediately.</p>

## Live demo

<div class="demo-panel component-demo">
  <h3>States</h3>
  <div class="button-row">
    <ws-switch aria-label="Enable notifications"></ws-switch>
    <ws-switch checked aria-label="Use dark mode"></ws-switch>
    <ws-switch disabled aria-label="Disabled switch"></ws-switch>
  </div>

  <h3>Icons</h3>
  <div class="button-row">
    <ws-switch checked aria-label="Use dark mode">
      <i slot="unchecked-icon" class="ri-sun-line" aria-hidden="true"></i>
      <i slot="checked-icon" class="ri-moon-line" aria-hidden="true"></i>
    </ws-switch>
  </div>
</div>

## Code

```html
<ws-switch aria-label="Enable notifications"></ws-switch>

<ws-switch checked aria-label="Use dark mode">
  <i slot="unchecked-icon" class="ri-sun-line" aria-hidden="true"></i>
  <i slot="checked-icon" class="ri-moon-line" aria-hidden="true"></i>
</ws-switch>

<ws-switch disabled aria-label="Disabled switch"></ws-switch>
```

## API

| Property     | Type      | Default | Description                                     |
| ------------ | --------- | ------- | ----------------------------------------------- |
| `checked`    | `boolean` | `false` | Current on/off state.                           |
| `disabled`   | `boolean` | `false` | Prevents interaction.                           |
| `aria-label` | `string`  | —       | Required when the switch has no external label. |

## Slots

| Slot             | Description                                      |
| ---------------- | ------------------------------------------------ |
| `checked-icon`   | Icon displayed inside the handle when checked.   |
| `unchecked-icon` | Icon displayed inside the handle when unchecked. |

## Events

| Event    | Description                                    |
| -------- | ---------------------------------------------- |
| `change` | Fired when user interaction changes `checked`. |

## Accessibility notes

- Give every switch a clear accessible name.
- Use switches for settings that take effect immediately; use checkboxes for form submission choices.
- Do not rely on the icon alone to communicate state.

## Design notes

- Pair icon switches with nearby text when the setting is not obvious.
- Disabled switches should explain why the setting cannot be changed in surrounding help text.
