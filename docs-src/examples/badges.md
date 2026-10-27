---
tags: reference
name: Store and source badges
description: Google's official Get it on Google Play badge, unaltered, and a source-code link with GitHub's mark.
category: marketing
icon: verified
status: experimental
tagName: [mnw-play-badge, mnw-github-badge]
importPath: material-next-web-components/marketing.js
order: 150
---

## Overview

- `<mnw-play-badge>` shows the English "Get it on Google Play" SVG badge, linking to your listing or developer account.
- `<mnw-github-badge>` is a link to the source repository with GitHub's mark, as a labelled pill or a compact icon button.

Use these standalone links in product content or a footer. The marketing top app bar contains identity only.

## Live demo

{% preview "badges" "" "hub-tokens demo__stage--center" %}

```html
<mnw-play-badge
  href="https://play.google.com/store/apps/details?id=com.example.notes"
></mnw-play-badge>
<mnw-play-badge href="…" style="--mnw-play-badge-height: 40px"></mnw-play-badge>
<mnw-github-badge
  href="https://github.com/example/pocket-notes"
></mnw-github-badge>
<mnw-github-badge
  href="https://github.com/example/pocket-notes"
  label="Source on GitHub"
  compact
></mnw-github-badge>
```

## Google Play badge rules

The badge is Google Play’s artwork in SVG format. The component adds clear space around it, with a minimum artwork height of 28px. [Google's badge guidelines](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/) allow scaling it whole, so set `--mnw-play-badge-height`; do not redraw, recolour, crop or animate it. Where space allows, show the line "Google Play and the Google Play logo are trademarks of Google LLC." The marketing shell's footer does, and exports it as `PLAY_TRADEMARK`.

The image loads from `badges/google-play/en.svg` under the marketing asset base; see [Assets](../../guides/marketing-hub/#assets).

## API

{% api "mnw-play-badge" "mnw-github-badge" %}

## Accessibility

- The Play badge's image has the alternative text "Get it on Google Play".
- The compact GitHub badge keeps its label for assistive technology and shows it as a tooltip.
- Both open in a new tab (`target="_blank"`, `rel="noopener"`).

## Limitations

- English badge only. For other languages, use Google's badge for that language as an image.
