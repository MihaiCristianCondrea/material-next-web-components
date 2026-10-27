---
tags: reference
name: Marketing shell
description: "The whole marketing hub page around an app's screen cards: top app bar, preview settings and the screen catalog."
category: marketing
icon: storefront
status: experimental
tagName: mnw-marketing-shell
importPath: material-next-web-components/marketing.js
order: 100
---

## Overview

`<mnw-marketing-shell>` is the page of a marketing hub: the shared [`mnw-app-shell`](../app-shell/) with a drawer closed by default (or an optional connected drawer), preview settings behind the **Preview settings** button in the top app bar, and the screen catalog. A marketing page has no footer. With `navigation-mode="none"` it has no drawer and no menu button either, for a hub that is one page of screens. The cards go in its default slot.

Most apps never use it directly: [`mountMarketingGallery()`](../../guides/marketing-hub/#the-gallery) renders it, fills it with live cards and wires every event. Use the element yourself only to build a different gallery (other card content, another data source) with the same page.

## Live demo

### Closed desktop drawer (default)

The sample gallery uses the default `navigation-mode="modal"`. The menu opens
the drawer at every width, including desktop; the content fills the available
width while it is closed.

{% preview "marketing-gallery-modal" "The default gallery, with a closed desktop drawer. Change the theme, palette or device frame, and open a card." "demo__stage--flush" %}

### Connected drawer (optional)

Set `navigation-mode="auto"` to keep the drawer visible from 900px. Below that
width the same navigation becomes a modal drawer.

{% preview "marketing-gallery-frame" "The same gallery opting into the connected drawer." "demo__stage--flush" %}

## Usage

The shell is controlled: it shows `settings`, and reports changes as events for you to apply.

```ts
import 'material-next-web-components/marketing.js';
import {
  DEFAULT_PREVIEW_SETTINGS,
  installHubStyles,
} from 'material-next-web-components/marketing.js';

installHubStyles(); // the hub's page tokens and body styles

const shell = document.createElement('mnw-marketing-shell');
// Closed at every width by default. Use 'auto' to opt into a connected drawer.
shell.navigationMode = 'modal';
shell.product = {
  id: 'pocket-notes',
  name: 'Pocket Notes',
  icon: '/logos/icon.svg',
};
shell.palettes = ['ocean', 'clay'];
shell.settings = DEFAULT_PREVIEW_SETTINGS;
shell.addEventListener('settings-change', (event) => {
  shell.settings = event.detail; // and apply them to your cards
});
document.body.append(shell);
```

`navigation-mode` defaults to `modal` (closed at every width). It also accepts `auto` (permanent from `permanent-from`, default 900px) or `permanent`. Switching keeps the same shell, navigation and screen nodes. The `navigation` slot accepts app-specific destinations, with Screens as the default.

### Top app bar actions

Anything in the `actions` slot sits at the trailing end of the top app bar,
after the **Preview settings** button, in reading order: icon buttons, buttons, links, menus or your own custom elements.

```html
<mnw-marketing-shell>
  <md-icon-button
    slot="actions"
    href="https://github.com/example/notes"
    aria-label="Source"
  >
    <md-icon>code</md-icon>
  </md-icon-button>
  <md-filled-tonal-button
    slot="actions"
    href="https://play.google.com/store/apps/details?id=com.example.notes"
  >
    Get the app
  </md-filled-tonal-button>
  <mnw-product-launcher slot="actions"></mnw-product-launcher>
</mnw-marketing-shell>
```

With `mountMarketingGallery()`, pass `actions: () => html\`...\``; it renders
in light DOM, so your page's styles apply. Give icon-only actions an
`aria-label`.

`product`, `settings`, `defaults` and `palettes` are JavaScript properties. The catalog shows its slotted cards directly.

## Product

`product` is a `MarketingProduct`:

| Field              | Type     |                                                      |
| ------------------ | -------- | ---------------------------------------------------- |
| `id`               | `string` | Required. Namespaces the saved preview settings.     |
| `name`             | `string` | Required. Top app bar and drawer.                    |
| `icon`             | `string` | Required. URL of a square icon.                      |
| `privacyUrl`       | `string` | Optional. Privacy Policy link in the drawer footer.  |
| `codeOfConductUrl` | `string` | Optional. Code of Conduct link in the drawer footer. |

## API

{% api "mnw-marketing-shell" %}

An empty default slot shows the `empty` fallback.

## Accessibility

- The app shell provides a skip link to the main content. The app bar names the page and the catalog is a labelled Screens region.
- **Preview settings** is an icon button with `aria-expanded`; it opens a labelled dialog of Material Web segmented buttons, a select and a switch, each with a visible label. Escape or a click outside closes it and returns focus to the button. `settings-open` reflects whether it is open.
- With `prefers-reduced-motion`, the top app bar's tone transition and the cards' entrance animation and shadow transition are off.

## Styling

The shell reads the hub tokens (`--mnw-hub-*`) that `installHubStyles()` defines on the page, in light and dark (`setHubTheme()`), with one accent so the app screens carry the colour. Set `--mnw-hub-font` to change the typeface (Google Sans Flex by default).

## Limitations

- It is a page, not a widget: the top app bar is sticky to the window. Use one per page.
- The device frames are image assets: copy them with [`mnw-marketing-assets`](../../guides/marketing-hub/#assets).
