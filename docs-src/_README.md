This directory contains the sources for the static documentation site. The site is based on the [Eleventy](https://www.11ty.dev/) static site generator.

The generated `docs` directory is a build artifact and is not committed. GitHub Actions builds the site for GitHub Pages from these sources.

To build the site locally, run:

```bash
npm run docs
```

To view the generated site locally, run:

```bash
npm run docs:serve
```

To edit the site, add to or edit files in this directory, then run `npm run docs`.
