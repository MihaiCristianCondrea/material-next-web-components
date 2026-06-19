# Documentation source

This directory contains the editable Eleventy sources for the documentation site. Treat
`docs-src/` as the source of truth for templates, markdown content, CSS, and static
assets. The generated `docs/` directory is build output and should not be edited by
hand.

The site preserves the visual design from the generated docs by keeping the shared
page shell, navigation, examples layout, markdown content, and `docs.css` in this
source tree. To change the published appearance, update the relevant files here and
then regenerate the site.

## Local workflow

Build the component library and generate the static site:

```bash
npm run docs
```

Preview the generated site locally:

```bash
npm run docs:serve
```

## Publishing

GitHub Actions builds the site from `docs-src/` and uploads the generated `docs/`
folder as the Pages artifact. Because Pages deployment is handled by the workflow,
do not commit generated `docs/` output unless the repository intentionally migrates
back to a tracked `/docs` publishing model.
