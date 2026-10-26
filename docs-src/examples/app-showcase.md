---
tags: reference
name: App showcase
description: Cards for a developer's Android apps, loaded from a JSON endpoint, each with a Google Play link.
category: components
icon: apps
status: experimental
tagName: mnw-app-showcase
importPath: material-next-web-components/app-showcase.js
order: 30
---

## Overview

`<mnw-app-showcase>` fetches a list of apps and shows them as outlined Material cards: icon, name, category, a short description and a Google Play button, with a "View all apps" link to the developer page. Use it on a website or an app's About page to promote a developer's other apps.

It is not a store listing or a review widget: it shows what the endpoint returns, without ratings or prices.

## Live demo

The demo reads a local fixture, `demos/assets/apps.json`, so it does not depend on a production API.

{% demo "app-showcase" "Two apps from a local JSON file. The buttons change limit without fetching again." "demo__stage--column" %}

## Data

`apps-endpoint` must return JSON as an array of apps, or an object with the apps in `data`, `apps`, `data.apps`, `promotedApps` or `androidApps` (checked in that order). For each app the element reads the first field present:

| Shown as    | Fields read, in order                                                  | When missing                |
| ----------- | ---------------------------------------------------------------------- | --------------------------- |
| Name        | `appName`, `name`, `title`                                             | The app is skipped          |
| Package     | `packageName`, `package`                                               | The app is skipped          |
| Category    | `category`, `appCategory`: a string, or `{label}`                      | "Android app"               |
| Description | `shortDescription`, `description`, `summary`: the first non-empty line | A generic sentence          |
| Icon        | `iconUrl`, `iconLogo`, `icon`, `image`                                 | A placeholder icon          |
| Play link   | `storeUrl`, `googlePlayUrl`, `url`                                     | Built from the package name |

```json
{
  "apps": [
    {
      "appName": "Smart Cleaner",
      "packageName": "com.d4rk.cleaner",
      "category": "Tools",
      "shortDescription": "See what fills your phone's storage and clear what you don't need.",
      "icon": "https://example.com/icons/app.png",
      "storeUrl": "https://play.google.com/store/apps/details?id=com.d4rk.cleaner"
    }
  ]
}
```

Without `apps-endpoint`, the element loads the author's public list from `mihaicristiancondrea.github.io`, and the default `headline` names the author. Set both for anything else.

## API

{% api "mnw-app-showcase" %}

## States and behaviour

- **Loading:** a circular progress indicator with "Loading apps…".
- **Error:** "Could not load app recommendations. Please try again later." The error is also logged to the console.
- Responses are cached per endpoint for the page's lifetime, and elements with the same endpoint share one request.
- Changing `apps-endpoint` fetches again; changing `limit` only shows more or fewer of the loaded apps.

## Accessibility

- The section is labelled by its heading. Each Play button has an accessible name such as "Open Smart Cleaner on Google Play"; links open in a new tab.
- App icons are decorative (`alt=""`): the name is always next to them.

## Limitations

- The endpoint must allow cross-origin requests (CORS) from your site.
- Icon and store URLs are used as given: relative URLs resolve against the page, not against the JSON file.
- The element fires no events; it has no selection.
