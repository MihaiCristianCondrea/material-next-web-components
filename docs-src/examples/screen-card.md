---
tags: reference
name: Screen card
description: A catalog card with a live app screen as its media, per-card theme and navigation toggles, and an Open action.
category: marketing
icon: smartphone
status: experimental
tagName: mnw-screen-card
importPath: material-next-web-components/marketing.js
order: 110
---

## Overview

`<mnw-screen-card>` presents one app screen in a catalog: the running screen fills the card's media area (or sits in a device frame), with the title, a category tag, a description, toggles for dark theme and 3-button navigation on that card only, and an **Open** button to the prototype page.

The card does not render the screen. Its default slot takes the element your screen renders into, usually through a [`ScreenHost`](../../guides/marketing-hub/#screenhost). The slot stays in light DOM, so the app's own CSS and palettes reach the screen.

## Live demo

{% demo "screen-card" "Each card hosts a sample screen with ScreenHost; the toggles report events that the page applies." "hub-tokens" %}

## Usage

The card is controlled: the toggles fire `card-theme-toggle` and `card-nav-toggle` with `{selected}`, and you set `dark` or `three-button` and update the screen. `mountMarketingGallery()` does all of this for every card.

- **Frameless** (default): the slotted element fills the media area. Its height is `--mnw-card-preview-height`. For the screen inside to fill it too, the element needs the `mnw-mount--fill` rule that `installHubStyles()` adds; `ScreenHost` sets that class when `fill` is on.
- **`framed`**: the slotted element (a device frame) is centred on a pedestal and scaled by `--mnw-card-device-zoom`.

## API

{% api "mnw-screen-card" %}

## Accessibility

- The media area is a group named "*heading* live preview"; the screen inside stays interactive.
- The heading links to `href`, as does the Open button; both are keyboard reachable.
- Each toggle has its own name ("Dark theme for Notes"); the selected state uses a filled icon, not colour alone.

## Limitations

- Without `href` there is no Open button and the heading is plain text.
- The toggles only report; nothing changes until you set `dark` or `three-button` and update the screen.
