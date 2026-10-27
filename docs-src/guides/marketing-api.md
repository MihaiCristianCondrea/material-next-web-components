---
tags: reference
name: Marketing API
description: Every export of material-next-web-components/marketing.js, from the page controllers to the building blocks they are made of.
category: guides
icon: data_object
status: experimental
importPath: material-next-web-components/marketing.js
order: 310
---

## Entry point

Everything here is exported from one module, `material-next-web-components/marketing.js`. Importing it also registers the marketing elements. The same files are reachable as `material-next-web-components/marketing/<path>.js` deep imports, but only the entry point is covered by the documentation and compatibility notes.

The code is layered:

- `domain`: products, screens, preview settings and App Toolkit's window rules. No DOM.
- `data`: where settings persist, and how a prototype view travels in a URL.
- `ui`: the elements, plus the Lit templates and constants they share.
- `hub`: the controllers that assemble the rest: gallery, prototype page, embed, `ScreenHost`.

Start with the [guide](../marketing-hub/). Exports marked **Building block** are what the controllers are made of: supported, but most hubs never call them.

## Page controllers

| Export                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mountMarketingGallery(options): GalleryHandle`                                            | Renders the gallery page. Options: `product`, `screens` (an array or a registry), `palettes?`, `defaults?: Partial<PreviewSettings>`, `prototypeUrl?` (`'screen.html'`), `root?` (`document.body`), `store?: PreviewSettingsStore`, `extra?: () => unknown`, `navigationMode?: 'auto' \| 'modal' \| 'permanent'` (default `'modal'`), `permanentFrom?: number` (900), `navigation?: () => unknown`, `actions?: () => unknown` (top app bar actions, trailing). The handle has `registry`, `settings()`, `update(patch)` and `destroy()`. |
| `mountScreenPrototype(options): {hosts(): ScreenHost[]}`                                   | Renders the prototype page, or the bare screen with `panel=none`. Options: `product`, `screens`, `palettes?`, `defaults?: Partial<PrototypeView>`, `galleryUrl?` (`'./'`), `adsToggle?` (`false`), `fillPhone?` (`true`), `root?`. Sets `data-ready` on `<html>` once fonts and icons load.                                                                                                                                                                                                                                              |
| `createMarketingEmbed({screens, loadTheme?, parts?})`                                      | For videos and capture scripts. Returns `{registry, setup(options?), mount(el, id, state?, {frame?, palette?, window?, showAds?}), mountPart(el, build, {palette?}), parts}`. `setup` takes `{assetBase?, marketingAssetBase?, palette?, theme?}`.                                                                                                                                                                                                                                                                                       |
| `settle(root): Promise<void>`                                                              | Waits until every Lit and Material Web element under `root` has rendered. `mount()` and `mountPart()` call it.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `GalleryOptions`, `GalleryHandle`, `PrototypeOptions`, `EmbedOptions`, `EmbedSetupOptions` | The option and return types above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## ScreenHost

| Export              |                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ScreenHost`        | `new ScreenHost(el, options)` hosts one live screen. Options, methods and behaviour are in the [guide](../marketing-hub/#screenhost). |
| `ScreenHostOptions` | `{registry, id, state?, palette?, theme?, frame?, navType?, window?, showAds?, fill?, onGo?, onChange?}`.                             |

## Screens and products

| Export                                          |                                                                                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MarketingScreen<S>`                            | A screen: `id`, `title`, `description`, `category?`, `categoryLabel?`, `palette?`, `defaults`, `controls?`, `render(state)`, `tick?(state, dt)`.   |
| `ScreenRenderContext`                           | What `render()` gets besides its state: `set?`, `go?`, `navType`, `window?`, `showAds`.                                                            |
| `ScreenState`                                   | `Record<string, unknown>`.                                                                                                                         |
| `ScreenControl`                                 | An inspector control: `presets`, `choice`, `toggle` or a slider. See the [screen inspector](../../examples/screen-inspector/#screen-controls).     |
| `createScreenRegistry(screens): ScreenRegistry` | Indexes screens by id and throws on a duplicate. The registry has `screens`, `byId(id)` and `categories()` (each category once, in catalog order). |
| `ScreenRegistry`                                | The registry's type.                                                                                                                               |
| `MarketingProduct`, `ProductLink`               | The product config. Fields are on the [marketing shell](../../examples/marketing-shell/#product) page.                                             |
| `normalizeProduct(product)`                     | **Building block.** Fills the optional fields (`links: []`, empty `version` and `credit`).                                                         |

## Preview settings

| Export                                           |                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `PreviewSettings`                                | `{theme, navType, palette, deviceFrame}`.                                           |
| `ThemeChoice`, `ResolvedTheme`, `NavType`        | `'system' \| 'light' \| 'dark'`, `'light' \| 'dark'`, `'gesture' \| 'buttons'`.     |
| `DEFAULT_PREVIEW_SETTINGS`                       | `{theme: 'system', navType: 'gesture', palette: 'captured', deviceFrame: false}`.   |
| `CAPTURED_PALETTE`                               | `'captured'`: each screen in the palette of its reference capture.                  |
| `THEME_CHOICES`, `NAV_TYPES`                     | The allowed values, in order.                                                       |
| `resolveTheme(theme, systemPrefersDark)`         | `'system'` to `'light'` or `'dark'`.                                                |
| `resolvePalette(palette, screenPalette)`         | The palette a screen renders with.                                                  |
| `paletteLabel(palette)`                          | "As captured", or the name in title case (`android-vivid` is "Android Vivid").      |
| `sanitizeSettings(input, {palettes, defaults?})` | **Building block.** Keeps known values and falls back to the defaults for the rest. |
| `settingsEqual(a, b)`                            | **Building block.** Compares two settings.                                          |

## Windows

App Toolkit's window sizes and adaptive shell rules, in dp (1dp = 1 CSS px).

| Export                                                               |                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WINDOWS`                                                            | `phone` (430 × 957, Pixel 9 Pro XL), `fold` (852 × 883, Pixel 9 Pro Fold) and `desktop` (1218 × 720, Pixelbook Go, no system bars).                                                                              |
| `WINDOW_NAMES`                                                       | `['phone', 'fold', 'desktop']`.                                                                                                                                                                                  |
| `windowOf(win)`                                                      | A `WindowSpec` from a name or a spec; the phone when empty.                                                                                                                                                      |
| `shellLayout(win): ShellLayout`                                      | The shell for a window: `mode` (`bottomBar`, `rail`, `expandedRail`, `permanentDrawer`), `framed`, `navWidth`, `listDetail`, `allowsLargeTopBar`, `statusBar` and `systemNav` heights, plus the window's fields. |
| `SHELL_POLICY`, `NAV_WIDTHS`, `LIST_DETAIL`                          | The breakpoints (rail from 600, expanded rail from 840, permanent drawer from 1200, list and detail from 600), the rail and drawer widths, and the list pane's 38% with its 24dp separator.                      |
| `WindowSpec`, `WindowName`, `DeviceName`, `ShellLayout`, `ShellMode` | Their types.                                                                                                                                                                                                     |

## Data

| Export                                                                        |                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createPreviewSettingsStore({productId, palettes, defaults?, storage?})`      | **Building block.** Saves settings in `localStorage` under `mnw-marketing:<productId>:preview`, falling back to memory when storage is unavailable. Pass your own `{getItem, setItem}` as `storage`. |
| `PreviewSettingsStore`                                                        | `{load(), save(settings)}`; pass one to `mountMarketingGallery()` to store settings elsewhere.                                                                                                       |
| `parsePrototypeView(params, {palettes, defaults?})`                           | **Building block.** Reads a `PrototypeView` from URL parameters (the table in the [guide](../marketing-hub/#the-prototype-page)), ignoring unknown values and broken JSON.                           |
| `writePrototypeView(url, view, defaults?)`                                    | **Building block.** Writes a view into a URL, leaving out defaults.                                                                                                                                  |
| `prototypeHref(base, id, {theme?, navType?, palette?, deviceFrame?, state?})` | **Building block.** The prototype link a gallery card opens.                                                                                                                                         |
| `PrototypeView`, `PrototypeMode`, `CompareAxis`                               | The view, `'inspect' \| 'compare'`, and `'theme' \| 'nav' \| 'palette' \| 'frame'`.                                                                                                                  |
| `DEFAULT_PROTOTYPE_VIEW`, `COMPARE_AXES`                                      | The defaults and the comparison axes.                                                                                                                                                                |

## Page styles and assets

| Export                             |                                                                                                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installHubStyles(doc?)`           | Adopts the hub's page stylesheet once and marks `<html>` with `data-mnw-hub`: the `--mnw-hub-*` tokens, the body, the light-DOM screen containers and capture mode. Both controllers call it; call it yourself when using the elements alone. |
| `setHubTheme(theme, doc?)`         | Sets the hub chrome to `'light'` or `'dark'`. Screens keep their own theme.                                                                                                                                                                   |
| `configureMarketingAssets({base})` | Where the device frames and the Play badge are served. Default `/material-next/`.                                                                                                                                                             |
| `marketingAsset(path)`             | The URL of one asset under that base.                                                                                                                                                                                                         |

## Elements

Importing the entry point registers these. Each has its own page with a live demo and the generated API.

| Element                                  | Class                                              | Page                                                           |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `<mnw-marketing-shell>`                  | `MaterialNextMarketingShell`                       | [Marketing shell](../../examples/marketing-shell/)             |
| `<mnw-screen-card>`                      | `MaterialNextScreenCard`                           | [Screen card](../../examples/screen-card/)                     |
| `<mnw-preview-controls>`                 | `MaterialNextPreviewControls`                      | [Preview controls](../../examples/preview-controls/)           |
| `<mnw-marketing-top-app-bar>`            | `MaterialNextMarketingTopAppBar`                   | [Marketing top app bar](../../examples/marketing-top-app-bar/) |
| `<mnw-device-frame>`                     | `MaterialNextDeviceFrame`                          | [Device frame](../../examples/device-frame/)                   |
| `<mnw-play-badge>`, `<mnw-github-badge>` | `MaterialNextPlayBadge`, `MaterialNextGithubBadge` | [Store and source badges](../../examples/badges/)              |
| `<mnw-prototype-layout>`                 | `MaterialNextPrototypeLayout`                      | [Prototype layout](../../examples/prototype-layout/)           |
| `<mnw-screen-inspector>`                 | `MaterialNextScreenInspector`                      | [Screen inspector](../../examples/screen-inspector/)           |

Event types: `SettingsChangeEvent` (`CustomEvent<PreviewSettings>`), `CardToggleEvent` (`CustomEvent<{selected}>`) and `CategoryChangeEvent` (`CustomEvent<{category}>`).

## Templates and constants

**Building blocks.** The Lit templates and values the elements share, for custom hub pages that should look the same.

| Export                                                        |                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `segments(items, current, onPick, label)`                     | A Material Web outlined segmented button set for one choice.                       |
| `select(label, items, value, onPick)`                         | A Material Web outlined select with fixed menu positioning.                        |
| `chips(items, current, onPick, label?)`                       | Filter chips for one choice; the caller owns the selection.                        |
| `controlPanel(controls, state, apply)`                        | A screen's `controls` as Material Web controls.                                    |
| `THEME_OPTIONS`, `NAV_OPTIONS`, `WINDOW_OPTIONS`, `NAV_ICONS` | `[value, label, icon]` options for those choices, and the system navigation icons. |
| `Option<T>`                                                   | The type of those options.                                                         |
| `ALL_CATEGORIES`                                              | `''`: the catalog filter's "All".                                                  |
| `PLAY_TRADEMARK`                                              | "Google Play and the Google Play logo are trademarks of Google LLC."               |
