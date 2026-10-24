---
tags: reference
name: Screen inspector
description: "The prototype page's side panel: screen details, view options, and each screen's own controls and presets."
category: marketing
icon: tune
status: experimental
tagName: mnw-screen-inspector
importPath: material-next-web-components/marketing.js
order: 170
---

## Overview

`<mnw-screen-inspector>` is the panel beside the live screen on the prototype page. From top to bottom: a link back to the gallery, the screen's category, title, description and Compose source, a screen picker, Inspect or Compare, then the view options (theme, system navigation, window, palette, device frame, ads) and the screen's own `controls`. At the end: **Reset state** and **Capture view**.

[`mountScreenPrototype()`](../../guides/marketing-hub/#the-prototype-page) renders it and applies everything it reports. Use it directly only for a custom prototype page.

## Live demo

{% demo "screen-inspector" "The page applies each event and passes the new view and state back. Here no screen is shown, so the effect is in the panel and the log." "hub-tokens" %}

## Screen controls

A screen's `controls` become the panel's last section. Each control edits one state key (`key`), except presets, which apply a whole patch. `patch` adds more state to every change.

| `type` | Shows | Fields |
| --- | --- | --- |
| `'presets'` | Assist chips | `label`, `options: [label, patch][]` |
| `'choice'` | Filter chips | `key`, `label`, `options: (string \| number)[]`, `patch?` |
| `'toggle'` | A switch | `key`, `label`, `patch?` |
| `'slider'` or anything else | A slider with its value | `key`, `label`, `min`, `max`, `step?`, `unit?`, `patch?` |

## API

{% api "mnw-screen-inspector" %}

`view` is a `PrototypeView`: `{mode, compare, palette, paletteB, theme, navType, deviceFrame, window, showAds, state, preset?, capture, id?}`, as `parsePrototypeView()` reads it from the URL.

## Accessibility

- Every group has a visible label; the selects and segmented buttons are named.
- The panel is ordinary content in the page's tab order, before the stage when used in `<mnw-prototype-layout>`.

## Limitations

- The panel only reports: without a page applying `view-change`, `screen-select`, `state-patch` and `state-reset`, nothing changes.
- The "Show ads" switch appears only with `ads-toggle`, for apps whose screens draw ad stand-ins.
