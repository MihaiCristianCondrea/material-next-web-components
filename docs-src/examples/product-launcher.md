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

Without a `catalog`, the launcher's favorites are the Android Insider and Apps Metadata admin consoles, GitHub, the developer’s Google Play account and Material Next, alongside the admin redirects from [android-apps-metadata-backend](https://android-apps-metadata-backend.mihaicristiancondrea.workers.dev/admin). This site's app bar uses it, with `current-product="web:material-next"`.

## Live demo

{% demo "product-launcher" "The first launcher uses the default catalog and hides Material Next, the current product. The second gets a custom catalog; its Pocket Notes entries are hidden on Pocket Notes' page. Both save to demo-only storage keys." "column" %}

### Colors

The default is the Google launcher palette: a pale blue `#E9EEF6` panel, a
`#F8FAFD` favorites card, and filled hover surfaces without tile outlines.
The host’s `color-scheme` selects Google light or dark surfaces. Artwork keeps its original colors. Turn on **Follow color palette** in the demo,
or add the boolean `follow-color-palette` attribute, to use the host’s Material
color roles instead. It is off by default.

```html
<mnw-product-launcher follow-color-palette></mnw-product-launcher>
```

There is one Android Insider destination, the [admin console](https://android-insider-backend.mihaicristiancondrea.workers.dev/admin/).
The Google Play icon opens [the developer account](https://play.google.com/store/apps/dev?id=5390214922640123642), rather than an individual app listing.
Existing favorites pointing at the old Android Insider app entry migrate to this developer link.

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

### Dark mode

The panel, favorites card, hover surfaces, edit controls and monochrome artwork follow the host's
`color-scheme`. This also works while the panel is open. Leave **Follow color palette** off for
Google's light and dark colors, or turn it on to use the host's Material roles.

Material Next's `applyColorTheme()` sets the scheme for light, dark and system modes. If a host owns
its theme, set `color-scheme: light`, `dark` or `light dark` on its root along with its color tokens.

### Icon artwork

The launcher draws each tile and its hover surface; an entry's `image` is only the mark. It is contained in a 40px square, so every icon reads at the same size whatever its proportions:

- **Format**: SVG first, then PNG or WebP (at least 80px for sharp 2x screens).
- **No frame of its own**: a transparent background, with no border, tile, circle or drop shadow. A logo that comes inside a rounded square looks smaller than its neighbours and doubles the tile.
- **Cropped close**: little empty margin around the artwork. A wide logo keeps its proportions and is fitted to the square's width.
- **One colour that inverts**: set `monochrome` for a single dark mark (GitHub's) so it turns light in dark themes.

### Entries and ids

Every entry has a `kind` and a `key`, and its id is `kind:key`:

| Kind          | For                                                | Example id                 |
| ------------- | -------------------------------------------------- | -------------------------- |
| `android-app` | An app's Play listing                              | `android-app:pocket-notes` |
| `web`         | A product site or web app                          | `web:material-next`        |
| `console`     | An admin console or API dashboard                  | `console:play-console`     |
| `shortcut`    | Anything else: a profile, a tool, an issue tracker | `shortcut:github`          |

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

Choose Edit to start a temporary draft. **Done** saves the draft and fires `launcher-change` once.
**Cancel**, Escape, clicking outside or closing the panel discard it. Other tabs continue to see
saved favorites until Done. Select an app to add or remove it; drag within Favorites to reorder,
or between Favorites and More apps to add or remove. A lifted preview follows the pointer while the other tiles move into place; dropping settles it into its slot. Entering and leaving Edit mode animates the panel and controls. Alt+arrow keys reorder, and Delete removes.
Reset to defaults also stays temporary until Done.

### Storage

`createLauncherPreferenceStore()` keeps `{"version": 1, "favoriteIds": [...]}` under `storage-key` (default `mnw-launcher:favorites`). It also reads a bare list and the older `{favoriteIds}` shape, turns the backend launcher's ids (`github-profile`) into this catalog's (`shortcut:github`), and keeps working in memory when storage is full, blocked or corrupt. Another tab's change updates the open launcher outside edit mode. Cancel reloads the latest saved list; Done saves the current draft. To keep favorites somewhere else, for example in an account, pass your own `store` with the same four methods.

## API

{% api "mnw-product-launcher" %}

Methods: `show()`, `close()`, `toggle()` and `reset()`; `favoriteIds` returns the current list (the draft while editing), hidden entries included. Calling `reset()` directly commits the defaults immediately and forgets storage.

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

The former Tutorials admin entry is named **Android Insider Admin Console**, preserving its saved ID. The built-in catalog does not offer Codex or Smart Cleaner. Existing stored IDs are preserved for compatibility with other catalogs but do not appear here. Hover highlights the tile surface without reshaping the icon. Edit mode uses a still grid with Cancel and Done above the apps.

The panel follows the Google apps launcher: a single rounded favorites surface, a plain shortcuts grid underneath, and no favorites/redirects counts. `redirects-heading` is empty by default; set it to show an optional section label.

## Accessibility

- The apps button reports `aria-expanded`; the panel is a labelled dialog that takes focus when it opens and returns it to the button when Escape, the close button or a tap on the scrim closes it. A click outside or tabbing past the panel closes it too.
- Edit moves focus to Cancel. Each favorite is a button named with its remove action and position, described by the reordering instructions. Done and Cancel return focus to Edit.
- Moves, additions, removals and resets are announced in a polite live region; focus stays on the moved tile or goes to its neighbour after a removal.
- Links that open a new tab say so to screen readers. Tiles are at least 96px tall. The drag preview is inert and hidden from accessibility tools.
- On phones (below 600px) the panel is a bottom sheet with a close button. Reduced motion disables opening, mode-change, reorder and drop animations. Closing or disconnecting clears active motion.

## Limitations

- The panel is placed under the button, aligned to its end edge; it suits app bars, not buttons near the start of the window.
- Favorites live on one device and origin unless you pass a `store` that syncs them.
- Favorites can be reordered or dragged to More apps to remove them. Entries in More apps can be dragged into Favorites or selected to add them. Changes remain temporary until Done.
