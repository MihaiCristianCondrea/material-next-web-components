---
tags: reference
name: Device frame
description: 'A device around a live screen: a Pixel 9 Pro XL drawn in 3D in any finish and at any angle, the Pixel 9 Pro Fold and the Pixelbook Go.'
category: marketing
icon: devices
status: experimental
tagName: mnw-device-frame
importPath: material-next-web-components/marketing.js
order: 140
---

## Overview

`<mnw-device-frame>` draws a device around whatever you slot in, sized so the display is exactly the window in CSS pixels (1dp = 1px):

| `device`                   | Window     | Frame size      | Drawn as                |
| -------------------------- | ---------- | --------------- | ----------------------- |
| `pixel_9_pro_xl` (default) | 430 × 957  | 465.23 × 988.76 | A 3D model, in three.js |
| `pixel_9_pro_fold` (open)  | 852 × 883  | 904.53 × 933.27 | Google's device art     |
| `pixelbook_go`             | 1218 × 720 | 1459.47 × 973.2 | Google's device art     |

These are the devices of the `WINDOWS` presets (`phone`, `fold`, `desktop`), so `ScreenHost` and `createMarketingEmbed()` pick the frame from the window. Use the element directly for a custom composition: a store screenshot, a press image, a video frame.

## Live demo

{% demo "device-frame" "One sample screen per device, laid out for its window. The phone is also shown in Hazel, turned, and in Porcelain from the back." "demo__stage--center" %}

## Usage

The slotted element is forced to the device's window size and corner radius. The slot stays in light DOM, so your page's CSS styles the screen and it stays interactive.

Scale a frame with CSS `zoom` (or `transform: scale()`) on the element, not by resizing it: the device and the display keep their exact proportions.

### The phone

The Pixel 9 Pro XL is built in three.js from Google's published measurements (76.6 × 162.8 × 8.5 mm) and product photos, and lit like Google's product shots. Choose its finish and angle with attributes:

```html
<mnw-device-frame finish="hazel" yaw="-24" pitch="6">
  <div class="my-screen"></div>
</mnw-device-frame>
```

- `finish`: `obsidian` (default), `porcelain`, `hazel` or `rose-quartz`.
- `yaw`: degrees about the vertical axis; negative shows the right edge with the keys. Past 90 the back faces you.
- `pitch`: degrees about the horizontal axis; positive leans the top away.
- `perspective`: how far the viewer stands from a turned phone, in CSS pixels (default `2400`).
- `logo`: a mark for the back, as the URL of a white-on-transparent image. None by default; the phone carries no brand unless you pass one. It is drawn the way a Pixel's is: in the back's own colour, polished where the glass is matte.

Head on (`yaw` and `pitch` both `0`), the screen is laid over the display without any transform, so text stays sharp for screenshots. Turned, it is turned with CSS 3D transforms that match the camera the phone is drawn with.

The phone is drawn once per finish and angle and shared by every frame on the page, so a gallery of phones uses one WebGL context. Until the picture is ready, and in a browser without WebGL, the frame draws the phone's outline in CSS. `await frame.updateComplete` waits for the picture, which is what capture scripts do before a screenshot.

three.js is a dependency of this package and loads only when a phone is drawn, as a separate chunk.

### A phone that moves

Set `yaw` and `pitch` as often as you like, for example from a scroll handler that turns the phone in as it arrives. The frame keeps that cheap:

- **Still:** a pose is drawn once, as a sharp picture at the screen's density, and every frame showing it shares it. The page keeps the 12 most recent pictures.
- **Moving:** when the pose changes again within 280 ms, the frame stops making pictures and draws the phone straight into a canvas, once per animation frame, at one device pixel per CSS pixel. Changes within one frame are drawn once. Nothing is encoded or decoded while it moves.
- **Settled:** 280 ms after the last change, the sharp picture replaces the canvas, which is freed.
- **Off screen:** a moving phone is not drawn until it scrolls back into view.

The phone is 23 draw calls and about 45,000 triangles, with one light probe made once per page. A page should still move one phone at a time; several still phones cost nothing after their first picture.

```js
// Scroll progress from 0 to 1 turns the phone in from three quarters to head on.
const progress = Math.min(
  1,
  Math.max(0, -section.getBoundingClientRect().top / section.offsetHeight)
);
frame.yaw = -40 * (1 - progress);
frame.pitch = 8 * (1 - progress);
```

Head on, a settled phone's screen is not transformed, so text stays sharp; while turned or moving it is a CSS 3D layer.

### The 3D model

The same phone is available as a three.js object for your own scenes, from `material-next-web-components/marketing/ui/pixel-model.js`:

```js
import {
  createPixelModel,
  createStudio,
  disposePixelModel,
} from 'material-next-web-components/marketing/ui/pixel-model.js';

const phone = createPixelModel({finish: 'porcelain'}); // a Group, in millimetres, display towards +Z
scene.environment = new PMREMGenerator(renderer).fromScene(
  createStudio(),
  0.02
).texture;
scene.add(phone);
// Later: scene.remove(phone); disposePixelModel(phone);
```

For a scroll-driven scene of your own, render only when the pose or the size changes (never in an idle loop), cap the renderer's pixel ratio at 2, lower it while the phone moves, and stop rendering while the canvas is off screen. `disposePixelModel(phone)` frees every geometry, material and texture the model made; the `backDecal` texture stays yours. `createPixelModel({merge: false})` keeps every part its own named mesh, for inspecting it; the default joins the parts that share a material.

`createStudio()` is the light the materials are tuned under: a bright studio with a black flag in front and a dark floor. `backDecal: {texture}` puts a mark on the back, as a white-on-transparent mask. The measurements are `PIXEL_9_PRO_XL`, exported from `marketing.js` with the finishes' colours (`PIXEL_FINISHES`).

## Assets

The fold and the Pixelbook Go are images: `device-frames/pixel_9_pro_fold/back.webp` and `mask.webp`, and `device-frames/pixelbook_go/land_back.png` and `land_shadow.png`. Copy them into your public folder with `npx mnw-marketing-assets public/material-next` and they load from `/material-next/`; if the site is served from a subpath, call `configureMarketingAssets({base})` first. See [Assets](../../guides/marketing-hub/#assets). The phone needs no files.

## API

{% api "mnw-device-frame" %}

`tone="dark"` deepens the drop shadow for dark pages; it does not change the device. The Pixelbook Go uses its own shadow image instead of a filter.

## Accessibility

- The device is decorative (`alt=""`); the slotted screen is the content and stays interactive.

## Limitations

- Three devices only, and only the phone is 3D. Other devices can be drawn with your own element around the same screen.
- A turned phone's screen is a transformed element: text on it is resampled, slightly softer than head on.
- The Pixelbook Go's glare layer is left out, so the screen stays as clear as on the phones.
