---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Home
---

# material-next-web-components

`material-next-web-components` is a Lit library for built-in Material Design custom elements and reusable product views.

The project starts with Google Material Web (`@material/web`) version `^2.4.1`, the latest release available for the Material Web package, and wraps those components into product-ready custom elements for your applications.

<section class="columns">
  <div>

## Built with Material Design

The home page below is rendered by the library's first custom element, `<mnw-home>`. It uses a Material Design filled button from `@material/web` so the documentation can show the same components that product pages will consume.

```html
<mnw-home docs-href="./install/"></mnw-home>
```

  </div>
  <div>

<mnw-home docs-href="./install/"></mnw-home>

  </div>
</section>

## Documentation source of truth

Documentation is authored in `docs-src` and compiled into a GitHub Pages artifact by GitHub Actions. The generated `docs` directory is intentionally not committed.

## App showcase

The first reusable product component is `<mnw-app-showcase>`, based on the app list preview in `references/github-dev-tools`. It fetches promoted apps, maps the Android app API response, caches the result, and renders Material cards and actions from the design library.

```html
<mnw-app-showcase></mnw-app-showcase>
```

<mnw-app-showcase></mnw-app-showcase>
