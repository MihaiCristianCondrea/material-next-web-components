---
tags: reference
name: Build a marketing hub
description: From an app's screens to a live gallery, a prototype page, PNG captures and Remotion videos, with one source for all of them.
category: guides
icon: storefront
status: experimental
importPath: material-next-web-components/marketing.js
order: 300
---

## What a marketing hub is

A marketing hub is a small web project, usually `marketing/ui` in the app's repository, that renders the app's real screens from a state object. Because each screen is a pure function of its state, the same code serves:

- a **gallery** where every screen runs live, with theme, palette, navigation and device-frame previews;
- a **prototype page** for one screen, with its controls, presets, window sizes and side-by-side comparisons;
- **captures**: PNGs for store listings and posts, from the prototype page's capture mode;
- **videos**: Remotion or any DOM-based tool mounts a screen per frame.

This guide builds one for **Pocket Notes**, a sample app with three screens. Its files are in this repository under `src/docs/sample-app/` and `docs-src/demos/assets/pocket-notes.css`, small enough to copy as a starting point.

{% preview "marketing-gallery-frame" "The finished sample hub. It is a demonstration: Pocket Notes is not a real app, and its store link goes to Google Play's home page." "demo__stage--flush" %}

<p><a class="demo-open" href="../../demos/marketing-hub/">Open the sample hub in its own tab <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span></a></p>

## Who provides what

| The library provides                                                                           | The app provides                                                   |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| The gallery page: shell, top app bar, preview settings, category filter, cards, footer         | Its **screens**: Lit templates translated from its Composables     |
| The prototype page: inspector, compare mode, window sizes, capture mode                        | Its **theme**: palettes as `[data-palette]` CSS, fonts, kit styles |
| `ScreenHost`: state, `set()` and `go()`, palette and theme, device frames, the animation clock | Its **product config**: name, icon, links                          |
| The embed API for videos and capture scripts                                                   | Its own motion parts, illustrations and campaign code              |
| Device art, the Play badge and App Toolkit's window rules                                      | Its brand: the hub chrome stays neutral so the screens carry it    |

The library never styles a screen. It renders each screen into a light-DOM element and sets `data-palette` and `data-theme` on it; the app's CSS does the rest.

## Install

```bash
npm install material-next-web-components lit @material/web
```

`lit` and `@material/web` are peer dependencies, so the app and the hub share one copy of each. Any bundler that understands package `exports` works; the examples use Vite.

## The product

One object describes the app to the hub. Keep it in `src/config/product.js`.

{% source "src/docs/sample-app/product.ts" %}

`id` namespaces the preview settings saved in the browser, so two hubs on `localhost:5173` keep their own. `storeUrl` adds the Google Play footer link and Google's trademark line; `repositoryUrl` adds a Source footer link. The full shape is on the [marketing shell](../../examples/marketing-shell/#product) page.

## Screens

A screen is a `MarketingScreen`: metadata, `defaults` for its state, and `render(state)`, which returns a Lit template. Here is the sample's home screen; `frame()` is the app's own helper that draws the status bar, the bottom bar or rail, and the system navigation.

{% source "src/docs/sample-app/screens.ts" %}

The important fields:

| Field                        |                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`, `title`, `description` | Shown on its card and in the inspector. Ids must be unique; `createScreenRegistry()` throws on duplicates. |
| `category`, `categoryLabel`  | Groups the catalog. The filter chips appear with two or more categories.                                   |
| `palette`                    | The palette of the reference capture, used when the hub's palette is "As captured".                        |
| `defaults`                   | The initial state. Every render gets `{...defaults, ...state}`.                                            |
| `controls`                   | Optional tweaks for the inspector: presets, choices, toggles, sliders.                                     |
| `tick(state, dt)`            | Optional clock: return a patch to animate while the screen is visible.                                     |
| `source`                     | Optional: the Composable it translates, shown in the inspector.                                            |

Besides its own state, `render()` receives a `ScreenRenderContext`:

- `set(patch)` merges a patch (or a function of the state) and renders again. The notes screen's filter chips call `set({filter: 'pinned'})`.
- `go(id, state?)` opens another screen. A note calls `go('editor', {noteId})`; in the gallery that opens the prototype page, in the prototype page it replaces the screen.
- `navType` is `'gesture'` or `'buttons'`, for the system navigation the screen draws.
- `window` is the window the screen lays itself out for (`'phone'`, `'fold'`, `'desktop'` or a size). `shellLayout(window)` gives App Toolkit's rule: a bottom bar below 600dp, a rail from 600, the permanent drawer from 1200.
- `showAds` is `false` unless a reviewer turns ad stand-ins on.

`set` and `go` are absent in videos, where the frame decides the state, so call them with `?.`.

### Rules that keep screens reusable

- **Everything from state.** No timers, `Math.random()` or CSS animations inside a screen: a video must get the same picture for the same state. Motion goes through `tick()` in the browser and through the frame number in a video.
- **The app's real strings and data.** A screen shows only states the app can show.
- **Translated, not designed.** Screens follow the Compose code; the hub's design never restyles them.
- **App Toolkit's own screens stay out.** Settings, onboarding and help belong to App Toolkit; a hub shows the app's own UI.

## Theme

Palettes are CSS, keyed by `data-palette` and `data-theme`, with Material's colour roles. The hub sets both on each screen's element:

```css
[data-palette='ocean'] {
  --md-sys-color-primary: #006684;
  --md-sys-color-surface: #f6fafd;
  /* every role the screens use */
}
[data-palette='ocean'][data-theme='dark'] {
  --md-sys-color-primary: #65d3ff;
  --md-sys-color-surface: #0f1417;
}
```

App Toolkit apps generate these from the app's Kotlin palettes. Load the app's fonts and Material Symbols yourself; the hub chrome uses Google Sans Flex when it is available.

## The gallery

The gallery uses `mnw-app-shell`, with a closed desktop drawer by default
(`navigationMode: 'modal'`). Set `navigationMode: 'auto'` for the
connected drawer (permanent from `permanentFrom`, 900px by default), or
`navigationMode: 'modal'` for a closed drawer at every width. `navigation` can
render additional destinations into the drawer. Privacy and conduct URLs are
product settings; the shared footer connects Light/Dark/System to the preview theme.

`src/gallery-page.js` is a few lines:

{% source "src/docs/pages/hub-gallery.ts" %}

`mountMarketingGallery()` renders the shell into `document.body` (or `root`) and a card per screen, each with a live `ScreenHost`. It also:

- installs the hub's page styles and follows the theme setting, including the system theme;
- saves the preview settings per product in `localStorage`, and works the same when storage is unavailable;
- keeps per-card theme and navigation toggles until a hub-wide choice replaces them;
- opens the prototype page when a card is opened, or when a screen inside a card calls `go()`, carrying the screen's id, the settings and the state in the URL.

It returns a handle with `settings()`, `update(patch)`, `destroy()` and the `registry`. `extra` adds app-specific sections after the catalog, such as motion parts; they render in light DOM with the app's CSS.

## The prototype page

`src/screen-page.js` is the same, with `mountScreenPrototype()`:

{% source "src/docs/pages/hub-prototype.ts" %}

{% preview "marketing-prototype-frame" "The sample's prototype page. Try Compare, the Fold window, or the Focus timer's controls." "demo__stage--flush" %}

The whole view lives in the URL, so a link reopens it exactly:

| Parameter             | Values                                                               |
| --------------------- | -------------------------------------------------------------------- |
| `id`                  | A screen id; the first screen when missing                           |
| `mode`, `compare`     | `inspect` or `compare`; `theme`, `nav`, `palette` or `frame`         |
| `palette`, `paletteB` | A palette name or `captured`                                         |
| `theme`, `nav`        | `system`, `light`, `dark`; `gesture`, `buttons`                      |
| `window`              | `phone`, `fold`, `desktop`                                           |
| `frame`               | `device` or `none`                                                   |
| `state`, `preset`     | JSON merged over the defaults; a preset's label                      |
| `ads`                 | `on` shows ad stand-ins (with `adsToggle`)                           |
| `panel`               | `none` is capture mode: the screen alone, framed with `frame=device` |

`fillPhone` (default `true`) makes a frameless phone fill the stage, for screens that adapt to their width. Turn it off when screens are laid out at a fixed 430 × 957dp. Larger windows keep their size and are scaled to fit.

The page sets `data-ready` on `<html>` once fonts and icons are loaded. Capture scripts wait for it:

```js
// scripts/capture.mjs (Playwright)
await page.goto(`${base}/screen.html?id=${id}&frame=none&panel=none`);
await page.waitForSelector('html[data-ready]');
await page.screenshot({path: `captures/${id}.png`});
```

## ScreenHost

`ScreenHost` runs one screen in an element: it owns the state, passes `set()` and `go()` to the screen, applies palette and theme, draws the device frame, and runs the clock for screens with `tick()`. The gallery and the prototype page use it; use it directly for a custom page.

{% demo "screen-host" "The buttons call the host's API and the switches call setOptions(). Tap a note or the Focus tab inside the screen: its go() reaches onGo, which loads the target in the same host." %}

| Option                         | Default                     |                                                             |
| ------------------------------ | --------------------------- | ----------------------------------------------------------- |
| `registry`, `id`               |                             | Required: the screens and the one to show                   |
| `state`                        | `{}`                        | Merged over the screen's defaults                           |
| `palette`                      | `'captured'`                | A palette name, or the screen's own                         |
| `theme`                        | light                       | `'light'` or `'dark'`                                       |
| `frame`                        | `false`                     | Draw the window's device around it                          |
| `navType`, `window`, `showAds` | `'gesture'`, phone, `false` | Passed to the screen                                        |
| `fill`                         | `false`                     | Stretch a frameless screen over its container               |
| `onGo(id, state, host)`        |                             | Handles `go()`; without it the host loads the target itself |
| `onChange(host)`               |                             | After `set()` and `reset()`; not after `load()` or `go()`   |

Methods: `load(id, state?)`, `reset()`, `setOptions(patch)`, `set(patch)`, `go(id, state?)`, `draw()` and `destroy()`. `screen`, `state` and `options` are readable. The clock runs only while a ticking screen is mounted and visible.

## Videos and deterministic captures

`createMarketingEmbed()` is the framework-free entry for Remotion, Playwright or anything with a DOM. There is no clock and no `set()` or `go()`: the caller computes the state for each frame. `mount()` resolves once every Lit and Material Web element under it has rendered, so a frame captured right after it is complete.

{% demo "embed" "Drag the slider: each frame number gives one state, and the same state always draws the same picture." %}

`setup()` runs once: it sets `data-motion="frame"` on `<html>` (turn CSS motion off for that attribute), applies a page-wide palette and theme if given, calls your `loadTheme()` and waits for Material Web's icons. Pass `marketingAssetBase` where the device frames are served, such as Remotion's `staticFile('/material-next/')`.

`mount(el, id, state, {frame, palette, window, showAds})` renders a screen. Without `palette`, the element keeps the page's palette. `mountPart(el, build)` renders one piece from the `parts` you passed, such as a card a film moves out of its screen, built by the same function the screen calls.

{% raw %}
```tsx
// Remotion: one component, a state per frame
import {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {createMarketingEmbed} from 'material-next-web-components/marketing.js';
import {SCREENS} from '../../ui/src/screens/index.js';
import {loadFonts} from '../../ui/src/theme/index.js';

const {setup, mount} = createMarketingEmbed({
  screens: SCREENS,
  loadTheme: loadFonts,
});
await setup({
  assetBase: staticFile('/'),
  marketingAssetBase: staticFile('/material-next/'),
});

export const LiveScreen = ({id, state}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender());
  useEffect(() => {
    void mount(ref.current!, id, state, {frame: true}).then(() =>
      continueRender(handle)
    );
  }, [id, JSON.stringify(state)]);
  return <div ref={ref} />;
};

<LiveScreen id="focus" state={{minutes: 1, elapsed: frame / fps}} />;
```
{% endraw %}

## Assets

The device frames and the Google Play badge are image files in the package. Copy them into the hub's public folder as part of its asset step:

```json
{
  "scripts": {
    "assets": "node scripts/sync-assets.mjs && mnw-marketing-assets public/material-next"
  }
}
```

`mnw-marketing-assets [destination]` copies `assets/marketing/` from the package (default destination `public/material-next`). The elements then load them from `/material-next/`. When the hub is served from a subpath (GitHub Pages, a Remotion `staticFile()`), point them elsewhere before rendering:

```ts
import {configureMarketingAssets} from 'material-next-web-components/marketing.js';

configureMarketingAssets({
  base: new URL('./material-next/', import.meta.url).href,
});
```

Add the destination to `.gitignore`: it is generated.

## Checklist

1. `product.js` with the real name, icon, store and repository links.
2. Every screen translated from its Composable, rendering only from state, with real strings.
3. A `category` on each screen, and `controls` for the states worth showing.
4. Palettes as `[data-palette]` CSS in light and dark; fonts and Material Symbols loaded.
5. `gallery-page.js` and `screen-page.js`, and `npm run assets` copying the marketing assets.
6. Captures and videos through the prototype page's capture mode or `createMarketingEmbed()`.

The [Marketing API](../marketing-api/) page lists every export of `material-next-web-components/marketing.js`.
