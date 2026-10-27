# Changelog

Last updated: October 27, 2026.

---

# 0.0.3 (Unreleased)

### Fixed

- A framed device on the prototype page could be taller than the stage and scroll: its fit was measured before the frame had its size, against a stage that grew with it, and CSS zoom left the frame artwork at full size.
- System color mode now opts plain host pages into light and dark browser colors. Launcher edit and close icons follow the panel colors, including when the host palette is disabled.

### Changed

- The marketing shell's preview settings open from a **Preview settings** button in the top app bar, so the screen catalog starts right under the bar. `<mnw-preview-controls>` takes `layout="stacked"` for a panel; `settings-open` reflects the panel's state.
- The prototype stage has no outlined card and never scrolls: a framed device or a large window is scaled to fit, and refits when the window, the frame or the screen changes size.
- The screen inspector no longer shows the screen's category, description and Compose source; the screen picker names the screen. `MarketingScreen.source` is removed.
- The product launcher demo's **Follow color palette** is a Material checkbox.
- Redesigned the product launcher with Google light and dark surfaces, single-line app labels and an uncluttered edit grid. Select apps or drag them between Favorites and More apps; Alt+arrow and Delete remain available on the keyboard.
- Launcher edits stay temporary until Done. Cancel, Escape and closing the panel discard the draft, and `launcher-change` reports only saved changes.

---

# 0.0.2 (October 27, 2026)

### Added

- Added `material-next-web-components/theme.js`: Material 3 color roles generated from one source color with Material Color Utilities, saved per origin. `<mnw-theme-button>` is a top app bar palette button that opens `<mnw-theme-controls>` (source color, dark, system or light, and a reset). `<mnw-color-picker>` is the reusable HCT color picker inside them, built from `<mnw-hct-slider>`. `colorScheme()`, `colorThemeCss()` and `applyColorTheme()` work without the elements.
- Added the palette button to the documentation site's top app bar; the chosen theme is remembered.
- Added an `actions` slot to `<mnw-marketing-shell>` for trailing top app bar actions: icon buttons, buttons, links or any custom element, such as `<mnw-product-launcher>`. `mountMarketingGallery()` takes them as `actions: () => unknown`. The standalone `<mnw-marketing-top-app-bar>` stays identity-only.
- Added launcher icon guidelines: SVG first, then PNG or WebP, transparent, with no border or tile of its own, cropped close to the artwork.

### Changed

- Changed launcher icons to fit one 40px square, so a wide logo such as Cloudflare's is no larger than a square one.
- Changed mocks to draw no scrollbars, as Compose draws none: screen hosts, screen cards and the prototype stage still scroll by wheel, touch and keys.
- Changed the docs top app bar to leave less room after its trailing actions.
- Changed the documentation footer: GitHub and Changelog are in the top app bar, so the footer no longer repeats them.
- Changed the package to depend on `@material/material-color-utilities` (Apache-2.0), for `theme.js`.
- Changed the documentation's dark tokens to follow `data-color-mode` on the root element, which the theme controls set.

### Fixed

- Fixed the sample app's floating action button overlapping the navigation bar with 3-button navigation. It now sits 16dp from the bottom-end corner of the content, above the navigation bar or beside the rail.
- Fixed CSS backslashes being read as JavaScript escapes when stylesheets are compiled into modules.
- Fixed incomplete tag stripping in the docs generator's text and anchor helpers.
- Fixed a slow regular expression when comparing launcher URLs.

### Security

- Code scanning now skips `references/`, the read-only upstream snapshots, and build output. Their alerts were in code Material Next does not ship or run.

# 0.0.1 (October 27, 2026)

The first release of Material Next: Material 3 Expressive web components built on Lit and Material Web.

- **Documentation elements**: product home, app showcase (from the public apps metadata API), code blocks, expressive section tabs, docs shell, page, navigation and table of contents. Each element has its own import and TypeScript declarations.
- **App shell**: a permanent or closed modal navigation drawer, one navigation tree, routing events for host-owned navigation and unsaved-change guards, and a drawer footer with Light, Dark and System themes and Privacy Policy and Code of Conduct links.
- **Marketing hub**: galleries, a prototype page with inspection and comparison, live screen hosts, device frames, captures and video embed controls, composed with the app shell.
- **Product launcher**: favorite products, consoles and shortcuts, with editing, pointer and keyboard reordering, local persistence shared across tabs, separate admin redirects, the Google launcher palette and an opt-in `follow-color-palette`.
- **Scrollbars** that follow the color palette across the page and component scroll areas, with system colors in high contrast.
- **Packaging**: JavaScript, declarations and the custom elements manifest build when installed from Git or packed. Project icons ship in `assets/marketing/` with the `mnw-marketing-assets` copy command.
- **Docs site** with a reference page and live demo for every element, a marketing hub guide, and a changelog page generated from this file.
