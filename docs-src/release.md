---
layout: docs.11ty.cjs
sidebar: false
title: Release checklist
heading: Release checklist
description: The checks before publishing a version to npm.
---

## How a release publishes

Publishing a GitHub release runs `.github/workflows/publish.yml`. It checks that the tag is the `package.json` version with a `v` (`v0.2.0` for `0.2.0`), then lints, builds, tests in Chromium, checks the package exports, and runs `npm publish --provenance` with the `NPM_KEY` repository secret. A release marked as a pre-release publishes under the `next` dist-tag. Running the workflow by hand with **dry-run** on builds and packs without publishing.

## Before tagging

1. `version` in `package.json` and a matching entry at the top of `CHANGELOG.md`, on `main`.
2. The local checks pass:

```bash
npm run build
npm run lint
npm test
npm run smoke:exports
npm run docs
npm run docs:check
npm pack --dry-run
```

3. `npm pack --dry-run` lists `dist/` (without `dist/test` and `dist/docs`), `assets/`, `bin/`, the README, licence, changelog and `custom-elements.json`.
4. The documentation is deployed and the pages for anything new or changed are checked on GitHub Pages.

## After publishing

- `npm view material-next-web-components version` shows the new version.
- Install it in a fresh project and import `material-next-web-components/marketing.js` and one element module.
