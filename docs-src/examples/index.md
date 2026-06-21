---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Examples
---

# Examples

Browse reusable Material Next Web Components as focused component recipes. The page is split into an elements navigation, component examples, and a table of contents so examples stay easy to scan.

<section class="examples-layout">
  <aside class="examples-nav">
    <mnw-docs-vertical-tabs></mnw-docs-vertical-tabs>
  </aside>

  <div class="examples-content">
    <section id="examples-overview" class="example-panel">

## Library elements

Each example pairs a live preview, copy-ready markup, and an action table that explains when to use the element.

    </section>

    <section id="expressive-tab-bar" class="example-panel">

## Expressive tab bar

Use `<md-expressive-tab-bar>` for top app/article navigation that should feel like the rounded Material documentation tabs while still being built on Material Web tabs.

<mnw-code-block language="html" copy code='<md-expressive-tab-bar active-index="2"></md-expressive-tab-bar>'></mnw-code-block>

<md-expressive-tab-bar active-index="2"></md-expressive-tab-bar>

| Action                   | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Show Material tabs       | Renders Material Web `<md-tabs>` and `<md-primary-tab>` inside a rounded expressive surface.  |
| Match article navigation | Uses 79px tab height, 24px icons, 24px inline padding, and pill-shaped active state.          |
| Handle navigation        | Emits cancelable `navigate` events and preserves default anchor navigation when not canceled. |

    </section>

    <section id="app-showcase" class="example-panel">

## App showcase

Use `<mnw-app-showcase>` when a docs or product page needs a ready-made app collection. Data fetching, response mapping, loading state, empty state, and request caching are handled by the component.

<mnw-code-block language="html" copy code='<mnw-app-showcase></mnw-app-showcase>'></mnw-code-block>

<mnw-app-showcase></mnw-app-showcase>

| Action                 | Description                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Fetch promoted apps    | Reads Android app metadata from the default endpoint or your `apps-endpoint` URL.               |
| Render resilient cards | Maps names, icons, categories, descriptions, and store links into responsive Material cards.    |
| Handle request states  | Shows loading progress, empty-state copy, and a friendly error message without extra page code. |

    </section>

    <section id="home-view" class="example-panel">

## Home view

Use `<mnw-home>` to render a documentation or product-home hero with Material typography, a rounded container, and a Material Design filled button.

<mnw-code-block language="html" copy code='<mnw-home docs-href="../install/"></mnw-home>'></mnw-code-block>

<mnw-home docs-href="../install/"></mnw-home>

| Action                 | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| Set the headline       | Use the `headline` attribute for page-specific hero messaging.                  |
| Link to docs           | Point `docs-href` at install or getting-started content for the primary action. |
| Add supporting content | Slot extra content below the call to action when a page needs more context.     |

    </section>

    <section id="code-block" class="example-panel">

## Code block

Use `<mnw-code-block>` for copy-paste examples. It uses Google Sans Code, Material copy chips, and theme-aware syntax colors for light and dark mode.

<mnw-code-block language="html" copy code='<mnw-code-block language="ts" copy code="const ready = true;"></mnw-code-block>'></mnw-code-block>

| Action                    | Description                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Label the language        | Set `language` to `html`, `ts`, `js`, `css`, or text so readers know the snippet context. |
| Enable copy               | Add `copy` to show a compact Material action that writes the snippet to the clipboard.    |
| Keep snippets theme-aware | Rely on the built-in Google Sans Code typography and light/dark syntax tokens.            |

    </section>

  </div>

  <aside class="examples-toc">
    <mnw-docs-table-of-contents></mnw-docs-table-of-contents>
  </aside>
</section>
