---
tags: reference
name: Home view
description: A ready-made documentation home with an introduction, a Get started action and a built-in examples view.
category: components
icon: home
status: experimental
tagName: mnw-home
importPath: material-next-web-components/material-next-home.js
order: 40
---

## Overview

`<mnw-home>` is a complete landing view for a component library's documentation: an introduction, a notice card, the headline with a tagline, and a **Get started** button that links to `docs-href`. Its second view, the examples view, shows the expressive tab bar, the app showcase and a code block with their own navigation and table of contents.

Its copy describes Material Next itself, so it suits Material Next's own pages and prototypes. For your product's landing page, compose the standalone components instead.

## Live demo

The view routes itself from `location.hash`, so the demo runs in its own page. Open `#examples` inside it to see the examples view.

{% preview "home-view-frame" "" "demo__stage--flush" %}

{% source "docs-src/demos/home-view.html" "html" %}

## Routing

- `#home` or no hash shows the home view.
- `#examples`, or the anchor of one of its examples (`#expressive-tab-bar`, `#app-showcase`, `#code-block`), shows the examples view and scrolls to it.
- The element listens to `hashchange` and `popstate` on `window` and pushes hash entries when its navigation is used, so use one `<mnw-home>` per page, and not on a page whose hash belongs to something else.

## API

{% api "mnw-home" %}

## Accessibility

- The content area is focusable for programmatic focus after navigation, without a visible outline.
- Its examples view uses the documentation navigation elements, which are named navigation landmarks.

## Limitations

- The introduction, notice and tagline are fixed text; only the headline and the button's link can be changed.
- The examples view loads the app showcase's default endpoint, which needs the network.
