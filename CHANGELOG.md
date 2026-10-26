# Changelog

Material Next Web Components has not been released yet. Version `0.0.1` is the
first planned release. The Lit starter's upstream history is not this library's
release history; attribution remains in `LICENSE` and the source headers.

## 0.0.1 (unreleased)

### Components

- Product home, app showcase, code block and expressive tab bar, built with Lit
  and Material Web. App showcase cards pair a proportionate icon with compact
  text and a trailing Google Play action. Expressive tabs use fully rounded
  container and selected-tab shapes.
- Documentation shell, top app bar, vertical navigation and table of contents.
  The site's six primary links share an animated selection pill that follows
  navigation, browser history and resizing, with reduced-motion support.
- Product launcher with editable favorites, pointer and keyboard reorder, reset,
  local persistence and separate admin redirects. The built-in catalog excludes
  Tutorials admin, Codex and Smart Cleaner, and their old SVGs are removed.
  Hover highlights the tile without changing the artwork's shape; favorites
  wobble throughout edit mode unless reduced motion is enabled.
- Experimental application shell and navigation items, with a single navigation
  tree, modal and permanent layouts, a connected app bar and a host-owned router.
  The live console demo covers deep links, browser history and unsaved changes,
  and switches in place between the connected presentation (Android Insider)
  and a modal drawer at every width (GitHub Dev Tools) without losing the route,
  screen state or navigation nodes. A layout switch keeps focus on a visible
  destination, or moves it to the menu button when the drawer is put away.

### Marketing hubs

- Live galleries, prototype inspection and comparison, `ScreenHost`, embed and
  capture APIs, device frames, badges and shared window rules. Assets are copied
  by `mnw-marketing-assets`.
- A clean marketing shell: app identity, preview controls, screen catalog and
  footer. The hero and its `MarketingProduct.headline` and `description` fields
  have been removed. Store/source links remain in the footer; no promotional
  buttons are injected into the top app bar.
- Shared sans-serif typography and Material Web typeface tokens for standalone
  controls as well as complete hubs, including inspector selects and segments.

### Tooling and distribution

- `lit` and `@material/web` are peer dependencies. Package exports, generated
  element API documentation, browser tests and a documentation-site checker
  cover the public entry points and demos.
- GitHub release publishing is configured with npm provenance. No release or npm
  publication has been made by this change.
- Updated development tooling; removed the obsolete gray-matter patch and
  js-yaml override. TypeScript stays at 6.0.3 because typescript-eslint 8.72.1
  supports TypeScript versions below 6.1, not 7.0.2.
