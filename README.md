# material-next-web-components

Material-inspired Lit custom elements for product views, documentation pages, navigation, and code presentation.

> Status: early-stage. The repository currently marks the package as private while the public API and npm publishing workflow are finalized.

## Links

- GitHub: <https://github.com/MihaiCristianCondrea/material-next-web-components>
- Source docs: [`docs-src`](./docs-src)
- Component examples: [`docs-src/examples`](./docs-src/examples)

## Install

When the package is published, install it with Material Web:

```bash
npm install material-next-web-components @material/web
```

Until then, use the local source workflow:

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

| Component                              | Import path                                          | Status             |
| -------------------------------------- | ---------------------------------------------------- | ------------------ |
| Code block                             | `material-next-web-components/code-block.js`         | Stable             |
| App showcase                           | `material-next-web-components/app-showcase.js`       | Experimental       |
| Expressive tab bar                     | `material-next-web-components/expressive-tab-bar.js` | Experimental       |
| Home view                              | `material-next-web-components/material-next-home.js` | Experimental       |
| Docs shell/page/top app bar/navigation | `material-next-web-components/docs/docs-page.js`     | Internal candidate |

## Documentation

Documentation is authored in [`docs-src`](./docs-src) and compiled by GitHub Actions for GitHub Pages. The generated `docs` directory is not committed.

Build the docs locally:

```bash
npm run docs
```

Serve the compiled docs locally:

```bash
npm run docs:serve
```

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
