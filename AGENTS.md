# Material Next Web Components: agent guide

Lit 3 custom elements on Material Web 2, published to npm as `material-next-web-components`. Read this before
changing the library; the README and the documentation site cover usage.

## Skills

Agent skills for this repository live in [android-skills](https://github.com/MihaiCristianCondrea/android-skills),
not here. The ones that apply:

- `marketing/skills/built-in/material-ui/m3/`: Material 3 components, tokens, layout and motion.
- `marketing/skills/built-in/marketing-ui/`: how app marketing hubs use the `marketing.js` module.
- `marketing/skills/built-in/writing-style/`: every word written, docs and commits included.
- `marketing/skills/design-taste/`: visual direction for the documentation site.

Shared marketing assets (device frames, the Google Play badge, launcher icons) have one copy, here in
`assets/marketing/`; android-skills refers to it. Add new shared assets here, never to both.

## Layout

- `src/*.ts`: standalone elements (code block, tab bar, app showcase, home, docs layout).
- `src/marketing/`, `src/launcher/`, `src/app-shell/`: modules in layers. `domain/` is pure (no DOM), `data/`
  persists or parses, `ui/` holds the elements. Each has an `index.ts` that is its package entry point.
- `src/internal/`: helpers the modules share (`environment.ts`, `_a11y.scss`). Not a package export; import it
  relatively, and reuse it rather than copying a helper into a module.
- `src/docs/`: the documentation site's scripts and demos. Not published.
- `docs-src/`: the Eleventy site. `docs/` and `dist/` are build output, never edited or committed.

## Conventions

- Tags use the `mnw-` prefix; `md-` belongs to Material Web.
- Every `.scss` compiles to a `*-styles.ts` next to it (`npm run build:scss`). Edit the `.scss`; never the
  generated file. Shared rules go in a `_partial.scss` and are `@use`d.
- Public properties, events, slots, CSS properties and parts are documented in JSDoc: the API tables are
  generated from `custom-elements.json`.
- Elements never own routing or history: they report with cancelable events and the app decides.
- Respect `prefers-reduced-motion` through `prefersReducedMotion()` in `src/internal/environment.ts`.

## Checks

Run before every push:

```bash
npm run build
npm run lint
npm test                 # Chromium, Firefox and WebKit; CHROME_PATH picks a local Chromium
npm run smoke:exports
npm run docs && npm run docs:check
```

`docs:check` fails on an export, element or demo without documentation, broken links or assets, console
errors, sideways scrolling at 360px, and demos that stop working. Add a check when you add a demo.
