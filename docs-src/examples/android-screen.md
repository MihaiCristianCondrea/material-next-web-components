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

- `definePreviewApp(config)`: the app's name and mark, its tabs, its drawer entries and footer, its overflow menu. One per app.
- `previewScreen(app, state, destination)`: what a screen renders. The destination gives its tab, title, app bar, content, FAB and overlay; nothing else.
- `<mnw-android-screen>`: the element `previewScreen()` renders. Use it directly when you wire events yourself.

Which controls appear is decided by `previewChrome()`, never by a screen, following App Toolkit's `ShellChrome.kt` and `ShellFrame.kt`:

| Layout (width)             | Navigation                   | App bar on a tab      | Rail button                |
| -------------------------- | ---------------------------- | --------------------- | -------------------------- |
| Bottom bar (< 600 dp)      | Navigation bar, modal drawer | Menu opens the drawer | None                       |
| Rail (600 dp)              | Collapsed rail               | No menu               | Expand: opens a modal rail |
| Expanded rail (840 dp)     | Rail, collapsed or expanded  | No menu               | Expand or collapse         |
| Permanent drawer (1200 dp) | Drawer with the tabs         | No menu               | None                       |

A child destination (`kind: 'child'`) shows Back in every layout and covers the navigation bar. The overflow button appears only on a tab's root, and only when the app declares overflow entries or the destination has actions.

## Live demo

{% demo "android-screen" "The same declaration in three windows: a bottom bar, an expandable rail, a permanent drawer." "demo__stage--center" %}

## Usage

```js
import {definePreviewApp, previewScreen} from 'material-next-web-components/marketing.js';

export const APP = definePreviewApp({
  name: 'App Toolkit',
  logo: '/logos/app_logo.svg',
  tabs: [
    {id: 'quick-tools', label: 'Quick Tools', icon: {name: 'grid_view', rounded: true}},
    {id: 'numbers', label: 'Measure', icon: 'straighten'},
    {id: 'apps', label: 'Apps', icon: 'apps'},
  ],
  drawer: {footer: [{id: 'settings', label: 'Settings', icon: 'settings'}]},
});

// In a MarketingScreen:
render(s) {
  return previewScreen(APP, s, {
    tab: 'numbers',
    title: 'Measure',
    content: html`...`,
    overlay: s.sheet ? {presentation: 'sheet', label: 'Counter', content: html`...`, onDismiss: () => s.set({sheet: null})} : null,
  });
}
```

Icons are Material Symbols names. `{name, rounded: true}` draws one from Material Symbols Rounded, which the page must load (`material-symbols/rounded.css`) as it loads Outlined.

The drawer, rail and menu state lives in the screen's own state as `drawerOpen`, `railExpanded`, `railOpen` and `overflowOpen`, so a preset or a URL (`state={"drawerOpen":true}`) can open them. A tab opens its `screen` (default: its id) with `go()`. An entry without `screen` is a page the preview does not draw: it is drawn like the app draws it, carries `data-preview-only` and the title "Not part of this preview", and only closes the navigation.

## Overlays

`overlay.presentation` is `sheet` (a `ModalBottomSheet` with no drag handle, opened straight to expanded over a 32% scrim) or `fullscreen` (a full-screen dialog over the status bar). The shell owns what every overlay needs:

- It is drawn inside the screen and clipped by it: no popover or top-layer content escapes the device frame.
- The content behind it is `inert`; focus moves into it when it opens and back to what opened it when it closes.
- Escape, the system Back button and the scrim close the topmost layer: the overflow menu, then the drawer or modal rail, then the overlay (`onDismiss`).

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
