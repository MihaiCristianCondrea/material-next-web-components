---
tags: reference
name: Prototype layout
description: "The prototype page's frame: the inspector panel on the leading side and a stage for the live screen."
category: marketing
icon: view_sidebar
status: experimental
tagName: mnw-prototype-layout
importPath: material-next-web-components/marketing.js
order: 160
---

## Overview

`<mnw-prototype-layout>` is a two-column page: a 360px `panel` slot on the leading side (usually an [`mnw-screen-inspector`](../screen-inspector/)) and a `stage` slot for the live screen. The stage is sticky, fills the window's height and scrolls if its content is larger. Below 1000px the two stack, panel first.

`mountScreenPrototype()` renders it. Both slots stay in light DOM, so the app's CSS reaches the screen on the stage.

## Live demo

The sample app's prototype page. Change the window, open Compare, or use the screen's own controls.

{% preview "marketing-prototype-frame" "Capture view opens the bare screen, as a capture script loads it." "demo__stage--flush" %}

```html
<mnw-prototype-layout>
  <mnw-screen-inspector slot="panel"></mnw-screen-inspector>
  <div slot="stage"><!-- the screen hosts render here --></div>
</mnw-prototype-layout>
```

## API

{% api "mnw-prototype-layout" %}

## Accessibility

- The panel is an `<aside>` and comes first in the page, so keyboard users reach "All screens" and the controls before the screen.
- The stage is a `<section>` named "Screen preview".

## Limitations

- It is a full page (`min-height: 100vh`) with a stage sized to the viewport; it does not fit inside another layout.
