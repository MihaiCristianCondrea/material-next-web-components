---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Install
---

# Install

Install the library and Material Web components from npm:

```bash
npm install material-next-web-components @material/web
```

## Import a component

```ts
import 'material-next-web-components/material-next-home.js';
```

## Use it in HTML

```html
<mnw-home docs-href="./install/"></mnw-home>
```

## Material Web baseline

This library tracks `@material/web` `^2.4.1`, which includes the Material Web component set used by Google Material Design for web components.

## Typography

All first-party components and documentation pages use Google Sans Flex as their default typeface. Add the Google Fonts preconnects and stylesheet once in your application `<head>` before rendering the components:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
  rel="stylesheet"
/>
```

Components set `font-family: 'Google Sans Flex', system-ui, sans-serif` internally, so the font is applied consistently once the stylesheet is loaded. Use Google Sans Code for code-specific surfaces only.
