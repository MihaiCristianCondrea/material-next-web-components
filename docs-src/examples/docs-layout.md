---
tags: reference
name: Docs shell and page
description: "The page frame of a documentation site: a full-height shell, a sticky top app bar and a centred content column."
category: layout
icon: web
status: internal
tagName: [mnw-docs-shell, mnw-docs-top-app-bar, mnw-docs-page]
importPath: [material-next-web-components/docs-shell.js, material-next-web-components/docs-top-app-bar.js, material-next-web-components/docs-page.js]
order: 200
---

## Overview

These three elements frame this documentation site:

- `<mnw-docs-shell>` is a full-height column: the `nav` slot, the page in a `<main>` landmark, then the `footer` slot.
- `<mnw-docs-top-app-bar>` is a sticky bar with `leading` (brand), default (navigation) and `trailing` (actions) areas. Below 960px the navigation gets its own scrolling row; below 600px the bar scrolls away with the page.
- `<mnw-docs-page>` centres its content with documentation spacing.

They are **internal candidates**: exported, used by this site, but their API may change before 1.0. They hold no state and fire no events; the content, links and routing are yours.

## Live demo

{% preview "docs-layout-frame" "" "demo__stage--flush" %}

{% source "docs-src/demos/docs-layout.html" "html" %}

The classes in this demo (`brand`, `site-nav`, `site-tab-link`, `btn`) come from this site's stylesheet: the elements lay out the slots, and the page styles what goes in them.

## API

{% api "mnw-docs-shell" "mnw-docs-top-app-bar" "mnw-docs-page" %}

## Accessibility

- The shell puts the page in a `<main>` landmark and the top app bar's default slot in a `<nav aria-label="Primary">`. Use links, not tabs, for site navigation inside it, and mark the current page with `aria-current="page"`.
- Add a skip link before the shell to jump to the content.

## Limitations

- Internal candidate: no compatibility promise before 1.0.
- The top app bar's background is a translucent surface with a blur; it does not change on scroll.
