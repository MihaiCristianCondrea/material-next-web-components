---
tags: reference
name: Android preview
description: "One declaration per app: the App Toolkit shell (app bars, bar, rail or drawer, insets, sheets) drawn around each marketing screen's content."
category: marketing
icon: smartphone
status: experimental
tagName: mnw-android-screen
importPath: material-next-web-components/marketing.js
order: 145
---

## Overview

Apps built on App Toolkit share one shell: the app bar and its search, the navigation the window calls for, the system bars and the sheets and drawers over the content. The Android preview draws that shell once, for every marketing UI, from a declaration of the app:

- `defineProductIdentity(config)`: the app's name, icons, fonts, palettes and destinations, declared once. `identity.app` is the shell declaration; `identity.product` is what the marketing hub shows. See [Product identity](#product-identity).
- `definePreviewApp(config)`: the shell declaration alone (name, mark, tabs, drawer entries and footer, overflow menu), for a preview without a hub.
- `previewScreen(app, state, destination)`: what a screen renders. The destination gives its tab, title, app bar, content, FAB and overlay; nothing else.
- `<mnw-android-screen>`: the element `previewScreen()` renders. Use it directly when you wire events yourself.

Which controls appear is decided by `previewChrome()`, never by a screen, following App Toolkit's `ShellChrome.kt` and `ShellFrame.kt`:

| Layout (width)             | Navigation                   | App bar on a tab      | Rail button                |
| -------------------------- | ---------------------------- | --------------------- | -------------------------- |
| Bottom bar (< 600 dp)      | Navigation bar, modal drawer | Menu opens the drawer | None                       |
| Rail (600 dp)              | Collapsed rail               | No menu               | Expand: opens a modal rail |
| Expanded rail (840 dp)     | Rail, collapsed or expanded  | No menu               | Expand or collapse         |
| Permanent drawer (1200 dp) | Drawer with the tabs         | No menu               | None                       |

A destination is a tab's `root`, a `child` pushed onto the tab, or a `page` such as settings or help. A child keeps the navigation bar and marks no tab. A page covers the navigation bar on a phone and opens beside the rail or drawer on wider windows. Both show Back.

The app bar on a tab's root names the app until the navigation beside it names the app, as an expanded rail or the permanent drawer does. From then on it names the tab. A child or page names itself through `title`, which also overrides the shell's title anywhere. When the title changes, the new one fades in, and an expanding rail shows its name and labels once it has opened.

The overflow button appears on a tab's root when the app declares overflow entries, beside any actions the destination adds. An expanded rail stays expanded when another tab or entry opens.

## Live demo

{% demo "android-screen" "The same declaration in three windows: a bottom bar, an expandable rail, a permanent drawer." "demo__stage--center" %}

## Usage

```js
import {
  defineProductIdentity,
  previewScreen,
  supportUs,
  toolkitFooter,
} from 'material-next-web-components/marketing.js';

// src/config/identity.js: toolkitGraph(appTitle, appIcon) { tab(...); drawer { toolkitFooter() }; overflow { supportUs() } }
export const IDENTITY = defineProductIdentity({
  id: 'app-toolkit',
  name: 'App Toolkit',
  icons: {app: '/logos/icon.svg', logo: '/logos/app_logo.svg'},
  fonts: {brand: {family: 'Google Sans Flex', src: 'fonts/GoogleSansFlex.ttf', weight: '1 1000', stretch: '25% 151%'}},
  colors: {palettes: ['captured', 'dynamic', 'blue'], defaultPalette: 'captured'},
  destinations: {
    tabs: [
      {id: 'quick-tools', label: 'Quick Tools', icon: {name: 'grid_view', rounded: true}},
      {id: 'numbers', label: 'Measure', icon: 'straighten'},
      {id: 'apps', label: 'Apps', icon: 'apps'},
    ],
    drawer: {footer: toolkitFooter()},
    overflow: [supportUs()],
  },
});

// In a MarketingScreen:
render(s) {
  return previewScreen(IDENTITY.app, s, {
    tab: 'numbers',
    title: 'Measure',
    content: html`...`,
    overlay: s.sheet ? {presentation: 'sheet', label: 'Counter', content: html`...`, onDismiss: () => s.set({sheet: null})} : null,
  });
}
```

Icons are Material Symbols names. `{name, rounded: true}` draws one from Material Symbols Rounded, which the page must load (`material-symbols/rounded.css`) as it loads Outlined.

The drawer, rail and menu state lives in the screen's own state as `drawerOpen`, `railExpanded`, `railOpen` and `overflowOpen`, so a preset or a URL (`state={"drawerOpen":true}`) can open them. A tab opens its `screen` (default: its id) with `go()`. An entry without `screen` is a page the preview does not draw: it is drawn like the app draws it, carries `data-preview-only` and the title "Not part of this preview", and only closes the navigation.

## Product identity

`defineProductIdentity()` is the one place an app names itself. Everything that draws the app reads it, so the app bar, the rail, the drawers, the previews and the marketing hub cannot disagree:

| Field           | What reads it                                                                                                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | The hub, to keep each app's saved preview settings apart.                                                                                                                                                                                                                                |
| `name`, `label` | `name` is the store's and the hub's. `label` is the name the app draws on itself (`R.string.app_name`): the app bar on a tab's root, the expanded rail, the drawer header. It defaults to `name`.                                                                                        |
| `icons`         | `app` is the square launcher icon: the hub. `logo` is the mark beside the name inside the app (`ShellGraph.appIcon`): the drawer header; it defaults to `app`. `monochrome` is the one-colour variant for artwork that needs it.                                                         |
| `fonts`         | `brand` and `plain` become `--md-ref-typeface-brand` and `--md-ref-typeface-plain`, which the shell, Material Web and the app's type scale read. With `src`, `loadProductFonts()` registers the face from the app's assets. `symbols` lists the icon fonts to wait for before a capture. |
| `colors`        | `palettes` lists the app's `data-palette` values in picker order (`captured` keeps the page's own tokens); `defaultPalette` is where previews start; `seed` is the brand colour for anything outside the app.                                                                            |
| `destinations`  | `tabs`, `drawer` and `overflow`, as in `definePreviewApp()`.                                                                                                                                                                                                                             |
| `links`         | `privacy` and `codeOfConduct` in the hub's drawer; `repository` for the app's own pages.                                                                                                                                                                                                 |

Assets stay in the app. The identity holds their paths and resolves them through `identity.asset(path)` against a base the host can move with `identity.setAssetBase()`, as a Remotion composition does for `staticFile()`; the drawer's mark is resolved when it is drawn, so a base set after the identity loads still applies.

### App Toolkit presets

`toolkitFooter({updates?, screens?})` and `supportUs({screen?})` are the App Toolkit library's own entries, as `ToolkitDrawer.kt` and `overflow { supportUs() }` declare them: Settings, Help & feedback, Updates (omit with `updates: false` when the app has no changelog) and Share, and Support the app. An app on App Toolkit declares only its tabs and its own entries; their pages are the library's, so they close the navigation unless the app maps one to a screen it draws.

## Overlays

`overlay.presentation` is `sheet` (a `ModalBottomSheet`, opened straight to expanded over a 32% scrim), `dialog` (an `AlertDialog` centred over the scrim, 280 to 560 dp wide by its content) or `fullscreen` (a full-screen dialog over the status bar). `handle: true` gives a sheet its drag handle; `flush: true` leaves the padding to the content, and a flush sheet lays its content out as a column, so the content's own scroll area scrolls and its footer stays pinned. The shell owns what every overlay needs:

- It is drawn inside the screen and clipped by it: no popover or top-layer content escapes the device frame.
- The content behind it is `inert`; focus moves into it when it opens and back to what opened it when it closes.
- Escape, the system Back button and the scrim close the topmost layer: the overflow menu, then the drawer or modal rail, then the overlay (`onDismiss`).

## Scrolling, bottom bars and lists

- `bottom` is the destination's own bottom bar (`Scaffold`'s `bottomBar`): an action row or a message field between the content and the navigation bar. Beside a rail it keeps clear of the system navigation.
- `collapse` (0 to 1) drives a large app bar for a screen that scrolls from its state, so a capture of any position is deterministic. Without it the bar follows the content's own scrolling, and `onScroll` reports the position (`scrollTop`, `scrollHeight`, `clientHeight`, `collapseHeight`) for a screen that follows it, such as reading progress.
- `scrollPosition` starts the content scrolled, for a capture of a scrolled screen. `titleLines` lets a large title wrap before it ellipsises.
- `hideNavigationBar` hides the navigation bar on scroll (`HideOnScrollBottomBar`) and gives its inset back to the content.
- A child drawn as the detail beside its tab's list on a wide window sets `besideList`, and its tab stays marked, as `highlightedTab` does.
- Drawer entries take a `badge`: a count, or `''` for the dot. `preview.statusBar: 'blank'` on the identity leaves the status bar empty, for timeless captures.

## Captures and videos

`previewScreen()` sets `interactive` only when the state has `set()`. Without it (`createMarketingEmbed()`, Remotion) the shell renders the state it is given: no handlers, no entrance animations, overlays already settled. `settle()` waits for the shell's own Material Web parts inside its shadow root.

## API

{% api "mnw-android-screen" %}

## Accessibility

- Navigation buttons are labelled "Open navigation drawer", "Expand navigation", "Collapse navigation" and "Navigate up"; the rail button reports `aria-expanded`.
- The drawer, modal rail and overlays are `role="dialog"` with `aria-modal`; the overflow menu is `role="menu"`.
- The selected tab and drawer destination carry `aria-current="page"`.

## Limitations

- List-detail panes and the scrolling behaviours of large app bars beyond collapse are left to the app's content.
- The system Home and Recents buttons are drawn but do nothing.
