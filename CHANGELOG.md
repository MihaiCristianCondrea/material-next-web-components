# Changelog

Last updated: October 27, 2026. The first planned release is `0.0.1`; no library
release has been published yet. Dated release sections begin when a release ships.

---

# Unreleased

### Added

- Added product home, app showcase, code blocks and expressive section navigation, with individual imports and TypeScript declarations.
- Added an application shell with connected permanent drawers or closed modal drawers, a single navigation tree, routing events that support host-owned navigation and unsaved-change guards.
- Added a reusable drawer footer with Light, Dark and System theme choices, Privacy Policy and Code of Conduct links.
- Added marketing galleries, prototype inspection and comparison, live screen hosts, device frames, captures and video embed controls.
- Added a product launcher with editable favorites, pointer and keyboard reordering, local persistence and separate console shortcuts.
- Added a Changelog page generated directly from this file.
- Added palette-aware scrollbars across the page and component scroll areas, with high-contrast system colors.
- Added an opt-in `follow-color-palette` launcher attribute; the default uses Google’s pale blue panel and filled hover surfaces.

### Changed

- Changed the marketing shell to start with a closed drawer at every width and compose the shared app shell. Applications can choose a permanent or closed drawer and supply their own navigation and policy links.
- Changed expressive tabs to inline icons and one animated, full-height rounded selection pill, matching the Material Design reference.
- Updated Android Insider Admin Console to its new admin URL. The duplicate Android app shortcut is replaced by a Google Play SVG badge linking to the developer account, including migration of saved favorites.
- Made unreleased packages build their JavaScript, declarations and element manifest when installed from Git or packed into a tarball.

### Improved

- Improved phone layouts, drawer keyboard focus and reduced-motion behavior. Switching drawer presentation preserves the current route, screen state and navigation nodes.
- Improved app showcase card spacing and consistent typography in standalone marketing controls.

### Removed

- Removed the marketing hero and its headline and description fields. The standalone marketing bar no longer exposes a context label or trailing promotional actions.
- Removed Codex and Smart Cleaner from the built-in launcher, the old launcher artwork, the favorites/redirects counts and the extra shaded favorites container.
- Removed the inherited Lit starter release history; it was not Material Next release history.
- Removed the `<md-expressive-tab-bar>` alias and the `material-next-web-components/docs/*.js` export aliases before the first release. Use `<mnw-expressive-tab-bar>` and the top-level `docs-*.js` modules; `md-` stays Material Web's prefix.
- Removed duplicated code: the docs navigation lists share one base class and stylesheet, and the elements and stores share one storage, reduced-motion and visually-hidden helper.

### Fixed

- Fixed focus falling to the page body when a focused menu button disappears beside a permanent drawer, including shells inside another shadow root.
- Fixed stale documentation entry bundles being reused after deployment by versioning their URLs.
- Fixed launcher hover tiles showing an inset outline instead of a filled surface.
- Fixed tab-link cancellation so canceled navigation leaves the current page unchanged.
- Fixed serif fallbacks in marketing selects and segmented controls, clipped phone navigation and misaligned catalog icons.
- Fixed the expressive tab bar filling a tab twice when switching: the pressed state layer no longer fills the tab before the selection pill slides in, and a scroll or resize during the slide retargets it instead of snapping.
- Fixed a product launcher moved in the DOM letting go of its store until its next update: `reset()` then kept the stored list, and changes from other tabs were missed.
- Fixed the API reference showing internal module paths instead of the `app-shell.js` and `launcher.js` entry points.
