---
layout: example.11ty.cjs
title: material-next-web-components ⌲ Examples ⌲ App showcase
tags: example
name: App showcase
description: Data-backed Material cards for promoted Android applications
icon: apps
tagName: mnw-app-showcase
order: 2
---

Use `<mnw-app-showcase>` when a page needs a responsive app collection with loading, error, empty,
and cached request states handled by the component.

## Live demo

<div class="demo-panel">
  <mnw-app-showcase limit="3"></mnw-app-showcase>
</div>

## Code

<mnw-code-block language="html" copy code='<mnw-app-showcase limit="3"></mnw-app-showcase>'></mnw-code-block>

## API

| Property        | Type     | Default                           | Description                               |
| --------------- | -------- | --------------------------------- | ----------------------------------------- |
| `apps-endpoint` | `string` | project API URL                   | Endpoint returning Android app metadata.  |
| `store-href`    | `string` | Google Play developer URL         | Destination for the section-level action. |
| `headline`      | `string` | `'More apps from Mihai-Cristian'` | Section heading.                          |
| `limit`         | `number` | `6`                               | Maximum number of app cards to render.    |

## Slots

| Slot | Description                                |
| ---- | ------------------------------------------ |
| none | App cards are generated from fetched data. |

## Events

| Event | Description                                             |
| ----- | ------------------------------------------------------- |
| none  | Uses native anchor navigation for card and store links. |

## Accessibility notes

- The loading indicator has an accessible label.
- App icons are decorative because the card text provides the app name.
- External Play Store links include descriptive accessible names.

## Design notes

- Use this component for curated collections, not arbitrary long lists.
- Keep `limit` low on landing pages to avoid overwhelming readers.
- Pair the showcase with surrounding copy that explains why these apps are relevant.
