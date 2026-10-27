# Changelog

Last updated: October 27, 2026.

---

# Unreleased

**Version:** `0.0.5`

### Added

- `mountMarketingHub()`: the gallery and the prototype in one page. A card opens its screen at `?id=<screen>` without a page load, and **All screens** or Back return to the gallery where it was scrolled; view transitions cross-fade the two where browsers have them. `mountScreenPrototype()` returns a handle with `destroy()`.
- `navigation-mode="none"` on `<mnw-app-shell>` and `<mnw-marketing-shell>` (`navigationMode: 'none'` for the gallery): no drawer and no menu button.

### Changed

- A marketing page has no footer: the gallery no longer renders the copyright bar.
- `<mnw-site-footer>` follows the design Profile started with: at most 900px wide (`--mnw-site-footer-max-width`) and centered, 24px corners, and stacked and centered below 600px. `--mnw-site-footer-container-color` sets its color.
- The documentation footer shows the author's social profiles instead of text links.
- The prototype scales a device to the stage's full height.
- The changelog dates each release and gives its version on the line below.

### Fixed

- `appearance="outlined"` squared off the modal drawer and drew a line along its edge. The modal drawer keeps its rounded corners; only a permanent drawer has the edge line.
- A palette select in the preview settings panel made the panel scroll when its menu opened. Selects open their menus in the top layer, and the panel no longer keeps a transform after its entrance.

---

# October 27, 2026

**Version:** `0.0.4`

### Added

- Added expandable drawer categories with `mnw-navigation-group`. Active destinations reveal their group and remain mounted when it closes.
- Added `mnw-site-footer`, a rounded copyright bar with optional social links, and a page footer slot on the app shell.
- App shell destinations support explicit hash routes such as `active-path="#projects"`.
- `appearance="outlined"` on `<mnw-app-shell>`: outline-variant lines under the top app bar, under the drawer header and along the drawer, on flat surfaces.
- `drawer-heading` on `<mnw-app-shell>`: a plain drawer title such as **Menu**, with a close button in the modal layout, for sites without a product brand.
- `navigation-size="large"` on `<mnw-app-shell>`: 56px destinations and categories with 16px labels, as in Material Components.
- `trailing-icon` and a `trailing` slot on `<mnw-navigation-item>`, for example `open_in_new` on a link that leaves the site.
- The launcher's default favorites include the **Apps Metadata Admin Console**, after Android Insider's, with its own icon.

### Changed

- The marketing gallery shows its screens directly, without a count or category filter chips. The old product name, version and links footer is replaced by the copyright bar.
- Gallery device frames stay off by default. Opening a screen shows its device frame, while explicit `frame=none` links and bare captures remain available.

### Fixed

- The whole drawer scrolled, taking the theme picker and policy links with it. Only the destinations scroll now; the header, brand and `navigation-footer` stay in place.
- Destinations wrapped in an app's own element (`<div slot="navigation">`) lost the space between them. Destinations and categories now pad themselves.

### Removed

- Removed App Toolkit from the launcher's default catalog.
- Removed the marketing shell's category filter API and product footer metadata fields.

### Security

- App showcase metadata accepts only HTTP(S) icon and store URLs; invalid store links fall back to Google Play.

---

# October 27, 2026

**Version:** `0.0.3`

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

# October 27, 2026

**Version:** `0.0.2`

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

# October 27, 2026

**Version:** `0.0.1`

The first release of Material Next: Material 3 Expressive web components built on Lit and Material Web.

- **Documentation elements**: product home, app showcase (from the public apps metadata API), code blocks, expressive section tabs, docs shell, page, navigation and table of contents. Each element has its own import and TypeScript declarations.
- **App shell**: a permanent or closed modal navigation drawer, one navigation tree, routing events for host-owned navigation and unsaved-change guards, and a drawer footer with Light, Dark and System themes and Privacy Policy and Code of Conduct links.
- **Marketing hub**: galleries, a prototype page with inspection and comparison, live screen hosts, device frames, captures and video embed controls, composed with the app shell.
- **Product launcher**: favorite products, consoles and shortcuts, with editing, pointer and keyboard reordering, local persistence shared across tabs, separate admin redirects, the Google launcher palette and an opt-in `follow-color-palette`.
- **Scrollbars** that follow the color palette across the page and component scroll areas, with system colors in high contrast.
- **Packaging**: JavaScript, declarations and the custom elements manifest build when installed from Git or packed. Project icons ship in `assets/marketing/` with the `mnw-marketing-assets` copy command.
- **Docs site** with a reference page and live demo for every element, a marketing hub guide, and a changelog page generated from this file.
