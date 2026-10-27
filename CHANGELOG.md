# Changelog

Last updated: October 27, 2026.

---

# 0.0.2 — Unreleased

### Added

- Added an `actions` slot to `<mnw-marketing-top-app-bar>` and `<mnw-marketing-shell>` for trailing top app bar actions: icon buttons, buttons, links or any custom element, such as `<mnw-product-launcher>`. `mountMarketingGallery()` takes them as `actions: () => unknown`.
- Added launcher icon guidelines: SVG first, then PNG or WebP, transparent, with no border or tile of its own, cropped close to the artwork.

### Changed

- Changed launcher icons to fit one 40px square, so a wide logo such as Cloudflare's is no larger than a square one.
- Changed mocks to draw no scrollbars, as Compose draws none: screen hosts, screen cards and the prototype stage still scroll by wheel, touch and keys.
- Changed the docs top app bar to leave less room after its trailing actions.

### Fixed

- Fixed the sample app's floating action button overlapping the navigation bar with 3-button navigation. It now sits 16dp from the bottom-end corner of the content, above the navigation bar or beside the rail.
- Fixed CSS backslashes being read as JavaScript escapes when stylesheets are compiled into modules.
- Fixed incomplete tag stripping in the docs generator's text and anchor helpers.
- Fixed a slow regular expression when comparing launcher URLs.

### Security

- Code scanning now skips `references/`, the read-only upstream snapshots, and build output. Their alerts were in code Material Next does not ship or run.

# 0.0.1 — October 27, 2026

The first release of Material Next: Material 3 Expressive web components built on Lit and Material Web.

- **Documentation elements**: product home, app showcase (from the public apps metadata API), code blocks, expressive section tabs, docs shell, page, navigation and table of contents. Each element has its own import and TypeScript declarations.
- **App shell**: a permanent or closed modal navigation drawer, one navigation tree, routing events for host-owned navigation and unsaved-change guards, and a drawer footer with Light, Dark and System themes and Privacy Policy and Code of Conduct links.
- **Marketing hub**: galleries, a prototype page with inspection and comparison, live screen hosts, device frames, captures and video embed controls, composed with the app shell.
- **Product launcher**: favorite products, consoles and shortcuts, with editing, pointer and keyboard reordering, local persistence shared across tabs, separate admin redirects, the Google launcher palette and an opt-in `follow-color-palette`.
- **Scrollbars** that follow the color palette across the page and component scroll areas, with system colors in high contrast.
- **Packaging**: JavaScript, declarations and the custom elements manifest build when installed from Git or packed. Project icons ship in `assets/marketing/` with the `mnw-marketing-assets` copy command.
- **Docs site** with a reference page and live demo for every element, a marketing hub guide, and a changelog page generated from this file.
