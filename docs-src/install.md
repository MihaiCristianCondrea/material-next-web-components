---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Install
---

# Install

Install the library next to Material Web:

```bash
npm install material-next-web-components @material/web
```

> Publishing note: this repository currently marks the package as private while the public API is being stabilized. If the package is not available in your registry yet, clone [MihaiCristianCondrea/material-next-web-components](https://github.com/MihaiCristianCondrea/material-next-web-components), run `npm install`, and build from source.

## Import one component

Import the module for each custom element you use:

```ts
import 'material-next-web-components/code-block.js';
import 'material-next-web-components/expressive-tab-bar.js';
```

## Use it in HTML

```html
<mnw-code-block language="ts" copy>
  <template>console.log('Hello Material Next');</template>
</mnw-code-block>
```

## Local source workflow

```bash
git clone https://github.com/MihaiCristianCondrea/material-next-web-components.git
cd material-next-web-components
npm install
npm run build
npm run docs
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

## Public component imports

| Component           | Import path                                          | Status             |
| ------------------- | ---------------------------------------------------- | ------------------ |
| Code block          | `material-next-web-components/code-block.js`         | Stable             |
| App showcase        | `material-next-web-components/app-showcase.js`       | Experimental       |
| Expressive tab bar  | `material-next-web-components/expressive-tab-bar.js` | Experimental       |
| Home view           | `material-next-web-components/material-next-home.js` | Experimental       |
| Docs infrastructure | `material-next-web-components/docs/docs-page.js`     | Internal candidate |
