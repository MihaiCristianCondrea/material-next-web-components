---
layout: docs.11ty.cjs
sidebar: false
title: Install
heading: Install
description: Add Material Next to a project, import the modules you use, and load the fonts the components expect.
---

## Package

```bash
npm install material-next-web-components lit @material/web
```

The package has not been released yet. npm publishing is configured through GitHub releases. Until the first release (0.0.1) is out, install from a clone instead: see [Build from source](#build-from-source).

`lit` (^3.3.3) and `@material/web` (^2.4.1) are **peer dependencies**: your app installs them, and the library uses the same copies, so there is one Lit and one set of Material Web elements on the page. npm 7 and later install peer dependencies automatically; listing them yourself keeps their versions explicit.

The package ships ES modules with TypeScript declarations (`.d.ts`) and a custom elements manifest (`custom-elements.json`). Use it with a bundler or dev server that resolves bare imports and package `exports`, such as Vite, Rollup, webpack or `@web/dev-server`.

## Imports

Import each module once, anywhere in your app's bundle. Importing an element's module registers its tag.

| Module                                                                                                                                    | Registers                                                                                                               | Status             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `material-next-web-components/code-block.js`                                                                                              | `<mnw-code-block>`                                                                                                      | Stable             |
| `material-next-web-components/expressive-tab-bar.js`                                                                                      | `<mnw-expressive-tab-bar>`                                                                                              | Experimental       |
| `material-next-web-components/app-showcase.js`                                                                                            | `<mnw-app-showcase>`                                                                                                    | Experimental       |
| `material-next-web-components/material-next-home.js`                                                                                      | `<mnw-home>` (and the elements it uses)                                                                                 | Experimental       |
| `material-next-web-components/marketing.js`                                                                                               | The eight marketing hub elements, and exports the [marketing API](../guides/marketing-api/)                             | Experimental       |
| `material-next-web-components/app-shell.js`                                                                                               | `<mnw-app-shell>` and `<mnw-navigation-item>`, with layout policies ([App shell](../examples/app-shell/))               | Experimental       |
| `material-next-web-components/launcher.js`                                                                                                | `<mnw-product-launcher>` and its catalog, favorites and storage API ([Product launcher](../examples/product-launcher/)) | Experimental       |
| `material-next-web-components/docs-shell.js`, `docs-top-app-bar.js`, `docs-page.js`, `docs-vertical-tabs.js`, `docs-table-of-contents.js` | The documentation layout elements                                                                                       | Internal candidate |

The root import, `material-next-web-components`, is the same as `material-next-home.js`. Every element module also exports its class (for example `MaterialNextCodeBlock`) for typing and `instanceof` checks.

```ts
import 'material-next-web-components/code-block.js';
import 'material-next-web-components/expressive-tab-bar.js';
import type {MaterialNextExpressiveTabBar} from 'material-next-web-components/expressive-tab-bar.js';
```

```html
<mnw-code-block
  language="ts"
  copy
  code="console.log('Hello, Material Next');"
></mnw-code-block>
```

## What the library provides, and what you provide

**The library provides** the custom elements, their styles (in shadow DOM), the Material Web components they use (imported for you), and the marketing hub's controllers, device art and badge images.

**You provide:**

- **Fonts.** The components use Google Sans Flex, with Google Sans Code for code, and Material Symbols Outlined for icons. Load them once in your page's `<head>`. Without them, text falls back to the system font and icons show their names.
- **Colours.** The components read Material colour roles (`--md-sys-color-*`) from the page, with light defaults. Define your scheme on `:root` (Material Theme Builder exports these) to match your brand and dark mode.
- **Marketing assets.** For the device frames and the Play badge, copy the images with `npx mnw-marketing-assets public/material-next`. See [Assets](../guides/marketing-hub/#assets).

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0"
  rel="stylesheet"
/>
```

Material Web's own components read `--md-ref-typeface-brand` and `--md-ref-typeface-plain`; set them to Google Sans Flex so the controls inside Material Next match its text:

```css
:root {
  --md-ref-typeface-brand: 'Google Sans Flex', system-ui, sans-serif;
  --md-ref-typeface-plain: 'Google Sans Flex', system-ui, sans-serif;
}
```

## Scrollbars

Importing a Material Next component enables palette-aware scrollbars on the
page and inside components. On fine-pointer devices they use a thin thumb in
`--md-sys-color-primary` over a transparent track, following local palettes and
light/dark themes. Touch devices keep their native scrollbars; high-contrast
mode uses system colors.

Set `--mnw-scrollbar-thumb` on a page or component to override the thumb color.
The product launcher uses Google's gray thumb by default and the host palette
when `follow-color-palette` is enabled.

## Browser support

The elements use standard custom elements, shadow DOM and modern CSS (`color-mix()`, `:has()`, container queries in `<mnw-home>`). They work in current Chrome, Edge, Firefox and Safari. The test suite runs in Chromium, Firefox and WebKit.

## Build from source

```bash
git clone https://github.com/MihaiCristianCondrea/material-next-web-components.git
cd material-next-web-components
npm install
npm run build      # compiles to dist/
npm pack           # a .tgz to install elsewhere with npm install ./material-next-web-components-0.0.1.tgz
```

`npm install`, Git dependency installs and `npm pack` run `prepare`, which builds
`dist/` and the element manifest. A packed or published package already contains
those files; consumers do not need the library's development tools.

To consume an unreleased checkout locally:

```bash
npm pack
# In the consuming app:
npm install /path/to/material-next-web-components-0.0.1.tgz
```

You can also use a Git dependency pinned to a full commit SHA. npm installs the
build dependencies and runs `prepare` before packing it. This requires lifecycle
scripts to be enabled; with scripts disabled, use the prebuilt tarball instead.

`npm run docs` builds this site into `docs/`, and `npm run docs:check` checks it in a browser under the GitHub Pages path.
