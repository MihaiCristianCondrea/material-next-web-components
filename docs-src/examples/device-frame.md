---
tags: reference
name: Device frame
description: "Google's device art around a live screen: the Pixel 9 Pro XL, the Pixel 9 Pro Fold and the Pixelbook Go."
category: marketing
icon: devices
status: experimental
tagName: mnw-device-frame
importPath: material-next-web-components/marketing.js
order: 140
---

## Overview

`<mnw-device-frame>` draws Google's device art around whatever you slot in, sized so the display is exactly the window in CSS pixels (1dp = 1px):

| `device` | Window | Frame size |
| --- | --- | --- |
| `pixel_9_pro_xl` (default) | 430 × 957 | 469 × 992 |
| `pixel_9_pro_fold` (open) | 852 × 883 | 904.53 × 933.27 |
| `pixelbook_go` | 1218 × 720 | 1459.47 × 973.2 |

These are the devices of the `WINDOWS` presets (`phone`, `fold`, `desktop`), so `ScreenHost` and `createMarketingEmbed()` pick the frame from the window. Use the element directly for a custom composition: a store screenshot, a press image, a video frame.

## Live demo

{% demo "device-frame" "One sample screen per device, laid out for its window: bottom bar, rail, desktop." "demo__stage--center" %}

## Usage

The slotted element is forced to the device's window size and corner radius, and the frame's mask (rounded corners, camera) is drawn over it. The slot stays in light DOM, so your page's CSS styles the screen.

Scale a frame with CSS `zoom` (or `transform: scale()`) on the element, not by resizing it: the art and the display keep their exact proportions.

## Assets

The frames are images: `device-frames/<device>/back.webp` and `mask.webp` for the phones, `land_back.png` and `land_shadow.png` for the Pixelbook Go. Copy them into your public folder with `npx mnw-marketing-assets public/material-next` and they load from `/material-next/`; if the site is served from a subpath, call `configureMarketingAssets({base})` first. See [Assets](../../guides/marketing-hub/#assets).

## API

{% api "mnw-device-frame" %}

`tone="dark"` deepens the drop shadow for dark pages; it does not change the device. The Pixelbook Go uses its own shadow image instead of a filter.

## Accessibility

- The art is decorative (`alt=""`); the slotted screen is the content and stays interactive.

## Limitations

- Three devices only. Other device art can be drawn with your own element around the same screen.
- The Pixelbook Go's glare layer is left out, so the screen stays as clear as on the phones.
