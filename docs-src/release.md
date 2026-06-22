---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Release checklist
---

# Release checklist

Use this checklist before publishing the package or cutting a public release.

## Package readiness

- Decide whether `private` should remain `true` or be removed for npm publishing.
- Verify every public export in `package.json` has matching JavaScript and declaration output in `dist/`.
- Keep docs infrastructure exports marked as internal-candidate until the API is stable.
- Confirm `files` includes the built output, README, license, changelog, and custom elements manifest.

## Required checks

```bash
npm run clean
npm run build
npm run analyze
npm run smoke:exports
npm run lint
npm test
npm run docs
```

## Documentation readiness

- Ensure install instructions match the real npm publication status.
- Confirm examples use the canonical `mnw-*` tag names.
- Review generated API output on `/api/` after `npm run analyze`.
- Validate the GitHub Pages build under nested routes.
