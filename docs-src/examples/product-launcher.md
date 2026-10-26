---
tags: reference
name: Product launcher
description: An apps button that opens favorite products, consoles and shortcuts, with admin redirects in their own section, editable favorites and local persistence.
category: components
icon: apps
status: experimental
tagName: mnw-product-launcher
importPath: material-next-web-components/launcher.js
order: 50
---

## Overview

`<mnw-product-launcher>` is the apps button of a product's app bar. It opens a panel with two parts:

- **Your favorites**: the visitor's own list of Android apps, web products, API consoles and external shortcuts. It is editable: add, remove, reorder, reset.
- **Admin redirects**: a fixed list of consoles (Play Console, Firebase, AdMob, Cloudflare). It stays its own section; while editing, a redirect can be copied into favorites.

Favorites persist in `localStorage` under one key, so every product served from the same origin shares them. The panel never offers the page you are on: entries matching `current-product`, `exclude` or this page's URL are hidden. A hidden favorite keeps its place for the pages where it shows.

Without a `catalog`, the launcher lists GitHub, Android Insider, Material Next, App Toolkit and the apps metadata console, alongside the admin redirects from [android-apps-metadata-backend](https://android-apps-metadata-backend.mihaicristiancondrea.workers.dev/admin). This site's app bar uses it, with `current-product="web:material-next"`.

## Live demo

{% demo "product-launcher" "The first launcher uses the default catalog and hides Material Next, the current product. The second gets a custom catalog; its Pocket Notes entries are hidden on Pocket Notes' page. Both save to demo-only storage keys." "column" %}

## Usage

Import the module and place the element in an app bar's trailing area:

```html
<script type="module">
  import 'material-next-web-components/launcher.js';
</script>

<mnw-product-launcher
  current-product="android-app:pocket-notes"
></mnw-product-launcher>
```

The project icons ship in `assets/marketing/launcher/`. Copy them with `npx mnw-marketing-assets public/material-next`, or point `configureMarketingAssets({base})` at where you serve them. An entry whose image fails to load shows its Material Symbol instead.

### Entries and ids

Every entry has a `kind` and a `key`, and its id is `kind:key`:

| Kind          | For                                                | Example id                  |
| ------------- | -------------------------------------------------- | --------------------------- |
| `android-app` | An app's Play listing                              | `android-app:pocket-notes` |
| `web`         | A product site or web app                          | `web:material-next`         |
| `console`     | An admin console or API dashboard                  | `console:play-console`      |
| `shortcut`    | Anything else: a profile, a tool, an issue tracker | `shortcut:github`           |

The kind is part of the id, so an app and its site can share a key (`android-app:pocket-notes`, `web:pocket-notes`). Keys use lowercase letters, digits, dots and dashes; `launcherItem()` rejects anything else. Stored favorites refer to ids only, so titles, URLs and icons can change without losing anyone's list.

### Your own catalog

```ts
import {createLauncherCatalog} from 'material-next-web-components/launcher.js';

launcher.catalog = createLauncherCatalog({
  items: [
    {
      kind: 'android-app',
      key: 'pocket-notes',
      title: 'Pocket Notes',
      href: 'https://play.google.com/store/apps/details?id=com.example.notes',
      icon: 'sticky_note_2',
      product: 'pocket-notes',
    },
    {
      kind: 'web',
      key: 'pocket-notes',
      title: 'Pocket Notes site',
      href: 'https://example.com/notes/',
      product: 'pocket-notes',
    },
    {
      kind: 'console',
      key: 'play-console',
      title: 'Play Console',
      href: 'https://play.google.com/console/',
      image: 'asset:launcher/play-console.svg',
    },
  ],
  defaultFavorites: ['android-app:pocket-notes'],
  redirects: ['console:play-console'],
});
```

`createLauncherCatalog()` deduplicates: a second entry with the same id or the same URL (ignoring query, hash and a trailing slash) is dropped, and the first one wins. Default favorites and redirects that name no entry are dropped too.

### Which entries a page shows

An entry is hidden when any of these match it:

- `current-product`: an item id (`web:material-next`) or a `product` name shared by several entries (`pocket-notes` hides its app and its site);
- `exclude`: more ids or product names, separated by spaces or commas;
- the page URL (`current-url`, or `location.href`): an entry linking to this page, or for `web` and `console` entries, to a page above it.

### Editing

The pencil button turns on edit mode. Then:

- each favorite has a remove badge; Delete or Backspace removes the focused one;
- drag a favorite with a mouse, pen or finger to reorder, or focus it and press Alt with the arrow keys (left and right by one, up and down by a row);
- redirects and the remaining entries (under **More**) become add buttons;
- **Reset** restores the catalog's default favorites and forgets the stored list.

Every change saves at once, fires `launcher-change` with the full list, and is announced to screen readers.

### Storage

`createLauncherPreferenceStore()` keeps `{"version": 1, "favoriteIds": [...]}` under `storage-key` (default `mnw-launcher:favorites`). It also reads a bare list and the older `{favoriteIds}` shape, turns the backend launcher's ids (`github-profile`) into this catalog's (`shortcut:github`), and keeps working in memory when storage is full, blocked or corrupt. Another tab's change updates the open launcher. To keep favorites somewhere else, for example in an account, pass your own `store` with the same four methods.

## API

{% api "mnw-product-launcher" %}

Methods: `show()`, `close()`, `toggle()` and `reset()`; `favoriteIds` returns the list, hidden entries included.

## Module exports

Everything below comes from `material-next-web-components/launcher.js`; `launcher/<path>.js` imports one layer.

| Layer             | Exports                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Domain: entries   | `launcherItem`, `launcherItemId`, `isLauncherItemId`, `normalizeHref`, `LAUNCHER_ITEM_KINDS`, types `LauncherItem`, `LauncherItemInput`, `LauncherItemId`, `LauncherItemKind`                    |
| Domain: catalog   | `createLauncherCatalog`, `findLauncherItem`, `normalizeFavoriteIds`, `MAX_FAVORITES` (48), type `LauncherCatalog`                                                                                |
| Domain: favorites | `resolveLauncher` (visible favorites, redirects, available entries, hidden favorite ids), `isExcluded`, `addFavorite`, `removeFavorite`, `moveFavorite`, types `LauncherContext`, `LauncherView` |
| Data              | `createLauncherPreferenceStore`, `DEFAULT_LAUNCHER_STORAGE_KEY`, types `LauncherPreferenceStore`, `KeyValueStorage`                                                                              |
| Catalog           | `PROJECT_LAUNCHER_CATALOG`, `PROJECT_LAUNCHER_ITEMS`, `migrateLegacyLauncherId`                                                                                                                  |
| UI                | `MaterialNextProductLauncher` (`<mnw-product-launcher>`), event types `LauncherChangeEvent`, `LauncherToggleEvent`                                                                               |

The domain functions are pure, so a server-rendered page or a test can work out what a launcher shows without a browser.

The built-in catalog no longer offers Tutorials admin, Codex or Smart Cleaner. Existing stored IDs are preserved for compatibility with other catalogs but do not appear here. Hover highlights the tile surface without reshaping the icon. Favorites wobble for the duration of edit mode; reduced motion disables this animation.

## Accessibility

- The apps button reports `aria-expanded`; the panel is a labelled dialog that takes focus when it opens and returns it to the button when Escape, the close button or a tap on the scrim closes it. A click outside or tabbing past the panel closes it too.
- The edit button is a toggle (`aria-pressed`). In edit mode each favorite is a focusable group named with its position ("GitHub profile, 1 of 2"), described by the reordering instructions.
- Moves, additions, removals and resets are announced in a polite live region; focus stays on the moved tile or goes to its neighbour after a removal.
- Links that open a new tab say so to screen readers. Tiles are at least 96px tall; the remove badge's hit area is 40px.
- On phones (below 600px) the panel is a bottom sheet with a close button. With reduced motion, the open, wobble and reorder animations are off.

## Limitations

- The panel is placed under the button, aligned to its end edge; it suits app bars, not buttons near the start of the window.
- Favorites live on one device and origin unless you pass a `store` that syncs them.
- Dragging works within favorites; redirects and other entries are added with their add buttons.
