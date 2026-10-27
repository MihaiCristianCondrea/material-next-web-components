# material-next-web-components

Material-inspired Lit custom elements for product views, documentation pages, navigation, and code presentation.

> Status: unreleased. `0.0.1` is the first planned release. npm publishing is configured through GitHub releases (see [Releasing](#releasing)); experimental APIs can still change.

## Links

- Documentation, with live demos: <https://mihaicristiancondrea.github.io/material-next-web-components/>
- GitHub: <https://github.com/MihaiCristianCondrea/material-next-web-components>
- Source docs: [`docs-src`](./docs-src)
- Component examples: [`docs-src/examples`](./docs-src/examples)

## Install

After the first release, install it with its peer dependencies, Lit and Material Web:

```bash
npm install material-next-web-components lit @material/web
```

Until then, build from source. To work on the library itself:

```bash
git clone https://github.com/MihaiCristianCondrea/material-next-web-components.git
cd material-next-web-components
npm install
npm run build
npm run docs
```

## Quick start

Import one component module and use the custom element in HTML:

```ts
import 'material-next-web-components/code-block.js';
```

```html
<mnw-code-block language="ts" copy>
  <template>console.log('Hello Material Next');</template>
</mnw-code-block>
```

## Components

| Component                              | Import path                                                                                                                                    | Status             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Code block                             | `material-next-web-components/code-block.js`                                                                                                   | Stable             |
| App showcase                           | `material-next-web-components/app-showcase.js`                                                                                                 | Experimental       |
| Expressive tab bar                     | `material-next-web-components/expressive-tab-bar.js`                                                                                           | Experimental       |
| Home view                              | `material-next-web-components/material-next-home.js`                                                                                           | Experimental       |
| Docs shell/page/top app bar/navigation | `material-next-web-components/docs-shell.js` (and `docs-page.js`, `docs-top-app-bar.js`, `docs-vertical-tabs.js`, `docs-table-of-contents.js`) | Internal candidate |
| Marketing hub                          | `material-next-web-components/marketing.js`                                                                                                    | Experimental       |
| App shell                              | `material-next-web-components/app-shell.js`                                                                                                    | Experimental       |
| Product launcher                       | `material-next-web-components/launcher.js`                                                                                                     | Experimental       |

## Marketing hub

`material-next-web-components/marketing.js` is a ready-made marketing hub for Android apps built with App Toolkit for Android, in the spirit of App Toolkit itself: the library does the heavy lifting, and each app's `marketing/ui` keeps only what is about the app. The app supplies:

- its **screens**: Lit templates translated from its Composables, each a pure function of state (`MarketingScreen`);
- its **theme**: App Toolkit's palettes as `[data-palette]` CSS, fonts and kit CSS;
- its **product config**: name, icon, one-line headline and description, store and repository links.

The library supplies the rest:

| Piece                                                                                                                            | What it is                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mountMarketingGallery()`                                                                                                        | The whole gallery page: shell, live screen cards, per-card theme and navigation toggles, category filter, settings saved per product                                            |
| `mountScreenPrototype()`                                                                                                         | The prototype page: inspect or compare (theme, navigation, palette, frame), the screen's own controls and presets, phone, fold and desktop windows, capture mode (`panel=none`) |
| `createMarketingEmbed()`                                                                                                         | `setup()`, `mount()` and `mountPart()` for Remotion and other headless tools, resolving once every element has rendered                                                         |
| `ScreenHost`                                                                                                                     | Hosts one live screen: state, `set()` and `go()`, palette and theme, device frame, an optional per-frame clock (`tick()`) that runs only while needed                           |
| `<mnw-marketing-shell>`                                                                                                          | Shared app shell with a permanent or closed drawer, preview settings, catalog and footer                                                                                        |
| `<mnw-screen-card>`, `<mnw-preview-controls>`, `<mnw-marketing-top-app-bar>`, `<mnw-prototype-layout>`, `<mnw-screen-inspector>` | The shell's parts, usable on their own                                                                                                                                          |
| `<mnw-device-frame>`                                                                                                             | Google's device art around a slotted screen: Pixel 9 Pro XL, Pixel 9 Pro Fold (open), Pixelbook Go                                                                              |
| `<mnw-play-badge>`, `<mnw-github-badge>`                                                                                         | Google's official Play badge, unaltered, and a source link with GitHub's mark                                                                                                   |
| `WINDOWS`, `shellLayout()`                                                                                                       | App Toolkit's window sizes and adaptive shell rules (bottom bar, rail, expanded rail, permanent drawer)                                                                         |

Screens render in light DOM, so the app's own CSS and palettes reach them; the hub chrome has its own neutral tokens (`--mnw-hub-*`) and one accent, so the screens carry the colour.

The marketing shell composes `mnw-app-shell`. Use `navigationMode: 'auto'` for a permanent drawer from 900px, or `'modal'` for a drawer that starts closed on desktop as well as phones. Both use the shared theme and policy footer.

A gallery page:

```js
import {mountMarketingGallery} from 'material-next-web-components/marketing.js';
import {loadFonts} from './theme/index.js';
import {SCREENS} from './screens/index.js';
import {PALETTES, PRODUCT} from './config/product.js';

await loadFonts();
mountMarketingGallery({product: PRODUCT, screens: SCREENS, palettes: PALETTES});
```

The prototype page is the same with `mountScreenPrototype()`. Copy the device frames and the badge into the hub's public folder as part of its asset sync:

```json
"assets": "node scripts/sync-assets.mjs && mnw-marketing-assets public/material-next"
```

They are then served from `/material-next/`; `configureMarketingAssets({base})` points elsewhere (a Remotion `staticFile()` folder, for example).

The code is layered: `marketing/domain` (products, screens, preview settings, window rules; no DOM), `marketing/data` (settings storage, prototype URLs), `marketing/ui` (elements and templates, Material Web only) and `marketing/hub` (the controllers that put them together).

## Documentation

The site at <https://mihaicristiancondrea.github.io/material-next-web-components/> has a page per element (live demo, copyable code, generated API), the [marketing hub guide](https://mihaicristiancondrea.github.io/material-next-web-components/guides/marketing-hub/) with a sample app, and the [API reference](https://mihaicristiancondrea.github.io/material-next-web-components/api/).

It is authored in [`docs-src`](./docs-src) with Eleventy and built by GitHub Actions for GitHub Pages; the generated `docs` directory is not committed. Demos are `docs-src/_demos/<id>.html` with an optional `src/docs/demos/<id>.ts`: the page shows that same source as the demo's code. The API tables come from `custom-elements.json`, so element documentation lives in JSDoc (`@fires`, `@slot`, `@cssprop`, property comments).

```bash
npm run docs          # build into docs/
npm run docs:check    # coverage, then every page in Chromium under /material-next-web-components/
npm run docs:serve    # serve docs/ locally
```

`docs:check` fails on undocumented exports or elements, broken links, anchors or assets, console errors, pages that scroll sideways at 360px, broken client-side navigation, and demos that stop working. The Pages workflow runs it before deploying.

## Development

Build the library:

```bash
npm run build
```

Run lint and tests:

```bash
npm run lint
npm test
```

Run the export smoke test:

```bash
npm run smoke:exports
```

## Releasing

Publishing a GitHub release publishes the package to npm (`.github/workflows/publish.yml`):

1. Set `version` in `package.json` (for example `0.0.1`) and add the entry to `CHANGELOG.md` on `main`.
2. Create a release whose tag is that version with a `v` (`v0.0.1`). A pre-release publishes under the `next` dist-tag.
3. The workflow checks the tag against `package.json`, lints, builds, tests in Chromium, then publishes with npm provenance using the `NPM_KEY` repository secret.

Run the workflow by hand with **dry-run** on to build and pack without publishing.

The `prepare` lifecycle builds the package and manifest for local installs, Git dependencies and `npm pack`. Tarball consumers receive the built files.
