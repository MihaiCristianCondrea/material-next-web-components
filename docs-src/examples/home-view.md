---
layout: example.11ty.cjs
title: material-next-web-components ⌲ Examples ⌲ Home view
tags: example
name: Home view
description: Product-ready documentation hero and install call to action
icon: home
order: 3
---

Use `<mnw-home>` to render a Material documentation home surface with built-in examples, install
copy, and a primary documentation action.

## Live demo

<div class="demo-panel">
  <mnw-home headline="Document Material Design views once" docs-href="../../install/"></mnw-home>
</div>

## Code

<mnw-code-block language="html" copy code='<mnw-home headline="Document Material Design views once"
docs-href="../../install/"></mnw-home>'></mnw-code-block>

## API

| Property    | Type     | Default                          | Description                               |
|-------------|----------|----------------------------------|-------------------------------------------|
| `headline`  | `string` | `'material-next-web-components'` | Main hero headline.                       |
| `docs-href` | `string` | `'./install/'`                   | URL for the install/documentation action. |

## Slots

| Slot    | Description                                               |
|---------|-----------------------------------------------------------|
| default | Optional supporting content rendered below the home view. |

## Events

| Event | Description                                              |
|-------|----------------------------------------------------------|
| none  | Internal navigation uses component state and URL hashes. |

## Accessibility notes

- Keep the `headline` unique on pages where this is the primary hero.
- Ensure `docs-href` points to a valid getting-started page.
- Avoid nesting multiple full home views on one page.

## Design notes

- Use this as a page-level view rather than a small card.
- Keep supporting slotted content short and scannable.
- Prefer the docs shell components for custom pages that do not need the built-in hero.
