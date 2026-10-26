---
tags: reference
name: App shell
description: "The frame of a web app or admin console: a navigation drawer that is modal or permanent by width, a top app bar with the screen's title and actions, and the screen."
category: components
icon: dashboard
status: experimental
tagName: [mnw-app-shell, mnw-navigation-item]
importPath: material-next-web-components/app-shell.js
order: 45
---

## Overview

`<mnw-app-shell>` is the frame around an application's screens, extracted from Android Insider's admin console:

- a **navigation drawer** with a brand, destinations (`<mnw-navigation-item>`) and a footer;
- a **top app bar** with a leading menu or back button, the screen's title and trailing actions;
- the **screen**, in a `<main>` landmark.

Below `permanent-from` (900px of the shell's width by default) the drawer is a **modal** sheet over a scrim, opened from the menu button. From that width it is a **permanent** column: drawer and app bar become one surface, and the screen sits in it as a pane with a rounded top-start corner. The navigation is one DOM tree in both layouts, so its state and listeners survive every resize.

The shell owns layout, drawer state, focus and motion. **The app owns routing**: the shell never changes the URL or reads history. It reports a tap on a destination with a cancelable `navigation-request`, and the app tells it where it is with `active-path`, `heading` and `leading`.

## Live demo

A small admin console: Feed, an article (with Back), Studio Bot, Lessons and Settings. Narrow the frame to get the modal drawer. In Lessons, type something, then pick another destination: the app's router asks before leaving. Every route is its own URL; reload or use Back and Forward inside the frame.

{% preview "app-shell-frame" "" "demo__stage--flush" %}

The console's markup:

{% source "docs-src/_includes/app-shell-demo.html" "html" %}

Its router, which is app code, not part of the library:

{% source "src/docs/pages/app-shell-demo.ts" "ts" %}

## Usage

```html
<script type="module">
  import 'material-next-web-components/app-shell.js';
</script>

<mnw-app-shell heading="Apps" active-path="/admin" permanent-from="800">
  <div slot="brand">Android Apps Metadata</div>
  <mnw-navigation-item slot="navigation" href="/admin" icon="apps" match="exact"
    >Apps</mnw-navigation-item
  >
  <mnw-navigation-item
    slot="navigation"
    href="/admin/categories"
    icon="category"
    >Categories</mnw-navigation-item
  >
  <mnw-product-launcher slot="actions"></mnw-product-launcher>
  <apps-dashboard></apps-dashboard>
</mnw-app-shell>
```

### Routing

Without a router, destinations are ordinary links: the browser follows them and the shell marks the current one from `location.pathname`.

With a router, handle `navigation-request`:

```ts
shell.addEventListener('navigation-request', async (event) => {
  event.preventDefault(); // the shell will not follow the link
  if (!(await editor.mayLeave())) return; // unsaved changes stay
  history.pushState(null, '', event.detail.url);
  render(new URL(event.detail.url));
});

function render(url: URL) {
  shell.heading = titleFor(url);
  shell.leading = isTopLevel(url) ? 'menu' : 'back';
  shell.activePath = url.pathname;
  // ...draw the screen
}
```

- Clicks with a modifier key, a middle click and items with `target="_blank"` are left to the browser and fire nothing, so opening a destination in a new tab still works.
- A request from the modal drawer closes it. If you handled it, focus moves to the screen's title, so keyboard and screen reader users land on the new screen; `focusHeading()` does the same after any navigation.
- `back-request` fires when the back button is pressed; go where Up should go, or call `history.back()`.

### The current destination

`active-path` (or `location.pathname`) marks one destination: the longest `href` that is the path or a parent of it, so `/admin/apps` is current on `/admin/apps/com.example`. `match="exact"` limits an item to its own path, which suits a root destination such as `/admin`. Plain links in the navigation slot get `aria-current="page"` the same way.

### Layout policy

`permanent-from` sets the breakpoint. It is measured on the shell's own width, so a shell inside a narrower container switches on its own. `navigation-mode="modal"` or `"permanent"` forces a layout. The `layout` attribute says which one is in use, for page CSS, and `navigation-mode-change` reports a switch.

For layouts with more rules, pass a policy:

```ts
import {createLayoutPolicy} from 'material-next-web-components/app-shell.js';

shell.layoutPolicy = createLayoutPolicy([
  {from: 0, mode: 'modal'},
  {from: 1200, mode: 'permanent'},
]);
```

Rules hold a width and a mode. Modal and permanent are the modes today; the rule list is where a rail or a bottom bar would go, without changing how policies are written.

### Choosing the drawer presentation

`github-dev-tools` uses a modal drawer that starts closed at every width. That
presentation already maps to `navigation-mode="modal"`: the top app bar and
screen use the full width until the menu opens an overlay. It should not reserve
a permanent empty drawer column.

Android Insider uses the connected frame beside an always-visible drawer. Keep
`navigation-mode="auto"` and the default `permanent-from="900"` for that layout;
below the breakpoint it becomes modal. A forced `navigation-mode="permanent"`
is useful only when the host guarantees enough room.

Next steps for consumers:

1. Add both presentations to the console demo with the same navigation nodes;
   verify resize, Escape, scrim, focus return and unchanged routing state.
2. Migrate Insider with the automatic modal/permanent policy, preserving deep
   links and unsaved-change guards.
3. Convert metadata to a SPA behind a preview route, then use the same policy
   with its own breakpoint before replacing `/admin`.
4. Migrate GitHub Dev Tools with a modal drawer at all widths, preserving its
   full-width content, theme controls and footer links.
5. Add a user-collapsible persistent drawer only when a consumer needs it. Keep
   open/closed preference with the host; the shell should not infer it from the
   repository name. A rail or bottom navigation remains a separate future mode.

### Theming

The shell reads Material's `--md-sys-color-*` tokens: `surface` for the screen and compact app bar, `surface-container` for the compact bar once content scrolls under it, `surface-container-low` for the drawer and the connected frame, `secondary-container` for the current destination. Sizes are custom properties (see below).

## API

{% api "mnw-app-shell" "mnw-navigation-item" %}

Methods: `openDrawer()`, `closeDrawer()`, `toggleDrawer()` and `focusHeading()`.

## Module exports

Everything below comes from `material-next-web-components/app-shell.js`; `app-shell/<path>.js` imports one layer.

| Layer                | Exports                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain: layout       | `createLayoutPolicy`, `appShellLayoutPolicy`, `resolveNavigationMode`, `DEFAULT_APP_SHELL_POLICY`, `DEFAULT_PERMANENT_DRAWER_FROM` (900), `APP_SHELL_NAVIGATION_MODES`, types `AppShellLayoutPolicy`, `AppShellLayoutRule`, `AppShellNavigationMode` |
| Domain: destinations | `findActiveDestination`, `destinationPath`, types `Destination`, `DestinationMatch`                                                                                                                                                                  |
| UI                   | `MaterialNextAppShell` (`<mnw-app-shell>`), `MaterialNextNavigationItem` (`<mnw-navigation-item>`), types `AppShellLeading`, `NavigationRequestDetail`, `NavigationRequestEvent`, `DrawerToggleEvent`, `NavigationModeChangeEvent`                   |

## Accessibility

- A **Skip to content** link is the shell's first tab stop; it moves focus to the `<main>` landmark.
- The drawer is a `<nav>` landmark named by `navigation-label`. The current destination has `aria-current="page"`.
- The menu button reports `aria-expanded`. The modal drawer opens in the top layer, focuses the current destination and makes the rest of the shell inert. Escape, a tap on the scrim, or the menu button closes it and returns focus to the menu button.
- The title is a heading (`heading-level`, default 1) that can take focus after a navigation.
- With reduced motion, the drawer, scrim and title change without animation.

## Limitations

- Two layouts: modal and permanent drawers. There is no navigation rail or bottom bar yet.
- The permanent drawer cannot be collapsed by the user.
- The modal drawer needs the Popover API (all current browsers) for the top layer; without it, it is a fixed layer that a transformed ancestor can clip.
- Content outside the shell stays focusable while the modal drawer is open; keep the shell as the page's root.
