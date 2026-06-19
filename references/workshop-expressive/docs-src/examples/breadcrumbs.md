---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Breadcrumbs
tags: example
name: Breadcrumbs
description: ws-breadcrumbs hierarchical navigation
order: 5
---

<p>Breadcrumbs show a user's position in a hierarchy and provide quick navigation to parent pages.</p>

## Live demo

<div class="demo-panel component-demo">
  <ws-breadcrumbs id="demo-breadcrumbs"></ws-breadcrumbs>
</div>

<script>
  document.querySelector('#demo-breadcrumbs').crumbs = [
    {id: 'home', label: 'Home', href: '#'},
    {id: 'components', label: 'Components', href: '#'},
    {id: 'breadcrumbs', label: 'Breadcrumbs'},
  ];
</script>

## Code

```html
<ws-breadcrumbs id="demo-breadcrumbs"></ws-breadcrumbs>
<script>
  document.querySelector('#demo-breadcrumbs').crumbs = [
    {id: 'home', label: 'Home', href: '/'},
    {id: 'components', label: 'Components', href: '/examples/'},
    {id: 'breadcrumbs', label: 'Breadcrumbs'},
  ];
</script>
```

## API

| Property | Type                          | Default | Description                                                                                     |
| -------- | ----------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `crumbs` | `Array<{ id, label, href? }>` | `[]`    | Ordered breadcrumb model. The last crumb is treated as the current page when `href` is omitted. |

## Slots

<p>`ws-breadcrumbs` is model-driven and does not expose content slots.</p>

## Events

| Event                 | Detail      | Description                                |
| --------------------- | ----------- | ------------------------------------------ |
| `ws-breadcrumb-click` | `{ crumb }` | Fired when a linked breadcrumb is clicked. |

## Accessibility notes

- Use breadcrumbs as supplemental navigation, not the only way to move around the site.
- Keep the current page crumb unlinked.

## Design notes

- Use short labels that match destination titles.
- Avoid showing breadcrumbs for shallow flows with no meaningful hierarchy.
