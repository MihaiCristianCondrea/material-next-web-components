---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Home
---

# material-next-web-components

`material-next-web-components` is a Lit library for built-in Material Design custom elements and reusable product views.

The project starts with Google Material Web (`@material/web`) version `^2.4.1`, and wraps those components into product-ready custom elements for your applications.

<section class="columns">
  <div>

## Built with Material Design

The home page below is rendered by the library's `<mnw-home>` custom element and keeps the documentation surface on Material tokens and Material Web components.

<mnw-code-block language="html" copy code='<mnw-home docs-href="./install/"></mnw-home>'></mnw-code-block>

  </div>
  <div>

<mnw-home docs-href="./install/"></mnw-home>

  </div>
</section>

## Google Sans typography

Load Google Sans Flex for product and documentation text, and Google Sans Code for code blocks and inline code. The docs site includes both font families in the document `<head>`.

<mnw-code-block language="html" copy code='<link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">'></mnw-code-block>

Use Google Sans Code for every code presentation surface:

<mnw-code-block language="css" copy code='.google-sans-code-snippet {
  font-family: "Google Sans Code", monospace;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
  font-variation-settings: "MONO" 1;
}'></mnw-code-block>

Google Sans Flex remains the default text face:

<mnw-code-block language="css" copy code='.google-sans-flex-body {
  font-family: "Google Sans Flex", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings:
    "slnt" 0,
    "wdth" 100,
    "GRAD" 0,
    "ROND" 0;
}'></mnw-code-block>

## Documentation source of truth

Documentation is authored in `docs-src` and compiled into a GitHub Pages artifact by GitHub Actions. The generated `docs` directory is intentionally not committed.
