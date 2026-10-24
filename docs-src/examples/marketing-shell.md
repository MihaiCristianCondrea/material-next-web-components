---
tags: reference
name: Marketing shell
description: "The whole marketing hub page around an app's screen cards: top app bar, hero, preview settings, category filter and footer."
category: marketing
icon: storefront
status: experimental
tagName: mnw-marketing-shell
importPath: material-next-web-components/marketing.js
order: 100
---

## Overview

`<mnw-marketing-shell>` is the page of a marketing hub: a top app bar with the app's icon and name, a short hero with the official Google Play badge and a source link, sticky preview settings, the screen catalog with category chips, and a footer with the credits and Google Play's trademark line. The cards go in its default slot.

Most apps never use it directly: [`mountMarketingGallery()`](../../guides/marketing-hub/#the-gallery) renders it, fills it with live cards and wires every event. Use the element yourself only to build a different gallery (other card content, another data source) with the same page.

## Live demo

The sample app's gallery, as `mountMarketingGallery()` renders it. Change the theme, palette or device frame, filter by category, and open a card.

{% preview "marketing-gallery-frame" "Pocket Notes is a sample product. Settings are saved in this browser per product." "demo__stage--flush" %}

## Usage

The shell is controlled: it shows `settings` and `category`, and reports changes as events for you to apply.

```ts
import 'material-next-web-components/marketing.js';
import {DEFAULT_PREVIEW_SETTINGS, installHubStyles} from 'material-next-web-components/marketing.js';

installHubStyles(); // the hub's page tokens and body styles

const shell = document.createElement('mnw-marketing-shell');
shell.product = {
  id: 'pocket-notes',
  name: 'Pocket Notes',
  icon: '/logos/icon.svg',
  headline: 'Every Pocket Notes screen, live',
  description: 'The app as it is: tap, scroll and switch themes in any card.',
  storeUrl: 'https://play.google.com/store/apps/details?id=com.example.notes',
  repositoryUrl: 'https://github.com/example/pocket-notes',
};
shell.palettes = ['ocean', 'clay'];
shell.categories = [{id: 'notes', label: 'Notes'}, {id: 'focus', label: 'Focus'}];
shell.settings = DEFAULT_PREVIEW_SETTINGS;
shell.count = 0;
shell.addEventListener('settings-change', (event) => {
  shell.settings = event.detail; // and apply them to your cards
});
shell.addEventListener('category-change', (event) => {
  shell.category = event.detail.category; // "" is every category
});
document.body.append(shell);
```

`product`, `settings`, `defaults`, `palettes` and `categories` are objects or arrays, so they are JavaScript properties only. `category`, `count` and `catalog-title` also have attributes.

## Product

`product` is a `MarketingProduct`:

| Field | Type | |
| --- | --- | --- |
| `id` | `string` | Required. Namespaces the saved preview settings. |
| `name` | `string` | Required. Top app bar, footer. |
| `icon` | `string` | Required. URL of a square icon. |
| `headline` | `string` | Required. The page's `<h1>`: one line on desktop. |
| `description` | `string` | Required. One sentence under it, 20 words at most. |
| `storeUrl` | `string` | Optional. Shows the Play badge, a Google Play footer link and the trademark line. |
| `repositoryUrl` | `string` | Optional. Shows the GitHub badges and a Source footer link. |
| `links` | `{label, href, icon?}[]` | Optional. More footer links. |
| `version` | `string` | Optional. Footer only, never in the hero. |
| `credit` | `string` | Optional. Footer line, such as the developer's name. |

## API

{% api "mnw-marketing-shell" %}

The category chips appear when there are two or more categories. With `count` at `0` the default slot is not rendered and the `empty` slot shows instead.

## Accessibility

- A "Skip to screens" link comes first. The hero heading is the page's `<h1>`, the catalog an `<h2>` with its count.
- Preview settings are a toolbar of labelled Material Web segmented buttons, a select and a switch; every control has a visible label.
- With `prefers-reduced-motion`, the top app bar's tone transition and the cards' entrance animation and shadow transition are off.

## Styling

The shell reads the hub tokens (`--mnw-hub-*`) that `installHubStyles()` defines on the page, in light and dark (`setHubTheme()`), with one accent so the app screens carry the colour. Set `--mnw-hub-font` to change the typeface (Google Sans Flex by default).

## Limitations

- It is a page, not a widget: the top app bar is sticky to the window and the hero is the page's `<h1>`. Use one per page.
- The Google Play badge and the device frames are image assets: copy them with [`mnw-marketing-assets`](../../guides/marketing-hub/#assets).
