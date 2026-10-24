---
tags: reference
name: Preview controls
description: "The hub's preview settings toolbar: theme, system navigation, palette and device frame, with a reset."
category: marketing
icon: tune
status: experimental
tagName: mnw-preview-controls
importPath: material-next-web-components/marketing.js
order: 120
---

## Overview

`<mnw-preview-controls>` is the toolbar above the hub's catalog. It shows the current `PreviewSettings` with Material Web components (segmented buttons for theme and navigation, a select for the palette, a switch for the device frame) and a **Reset** action once anything differs from `defaults`. The marketing shell includes one; use it on its own in a custom hub page.

## Live demo

{% demo "preview-controls" "The page owns the settings: each settings-change is applied and passed back." "hub-tokens demo__stage--column" %}

## Settings

`PreviewSettings` is:

| Field | Type | Default |
| --- | --- | --- |
| `theme` | `'system' \| 'light' \| 'dark'` | `'system'` |
| `navType` | `'gesture' \| 'buttons'` | `'gesture'` |
| `palette` | `string`: a palette name, or `'captured'` for each screen's own | `'captured'` |
| `deviceFrame` | `boolean` | `false` |

`settings-change` carries the complete new settings, not a patch. Reset sends `defaults`. The palette select appears only when `palettes` is not empty, and always offers "As captured" first.

## API

{% api "mnw-preview-controls" %}

## Accessibility

- The bar is a `toolbar` named "Preview settings"; every group has a visible label over a 40px control.
- The segmented buttons and the select are named ("Preview theme", "System navigation", "Palette"), and the switch "Device frame".

## Limitations

- Window size (phone, fold, desktop) is a prototype-page setting, in the [screen inspector](../screen-inspector/), not here.
