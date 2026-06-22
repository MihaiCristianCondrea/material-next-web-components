# material-next-web-components

Built-in Material Design custom elements and product views for web products.

This library is written with Lit and starts with the latest Material Web component package, `@material/web` `^2.4.1`. Components in this repository wrap Material Design primitives into reusable custom elements and views that can be used across applications.

## Documentation

Documentation is authored in [`docs-src`](./docs-src) and compiled by GitHub Actions for GitHub Pages. The generated `docs` directory is not committed.

Install dependencies and build the docs locally:

```bash
npm install
npm run docs
```

Serve the compiled docs locally:

```bash
npm run docs:serve
```

## Component example

```html
<mnw-home docs-href="./install/"></mnw-home>
```

## Development

Install dependencies:

```bash
npm install
```

Build the library:

```bash
npm run build
```

Run tests:

```bash
npm test
```
