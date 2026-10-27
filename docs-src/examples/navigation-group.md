---
tags: reference
name: Navigation group
description: 'Expandable categories for an app shell drawer.'
category: components
icon: account_tree
status: experimental
tagName: mnw-navigation-group
importPath: material-next-web-components/app-shell.js
order: 47
---

## Overview

`<mnw-navigation-group>` groups destinations under a category button. Enter, Space or a click opens
it. Destinations stay mounted while collapsed, so their state survives. A newly active destination
opens its group. The app shell reveals an active group before focusing its destination when the
drawer opens.

{% preview "navigation-group" "Open Profile to reveal its destinations." %}

```html
<mnw-navigation-group slot="navigation" label="Profile" icon="person">
  <mnw-navigation-item href="#contact">Contact</mnw-navigation-item>
  <mnw-navigation-item href="#about-me">About Me</mnw-navigation-item>
</mnw-navigation-group>
```

The `open` boolean attribute controls expansion. Collapse removes children from keyboard navigation
and the accessibility tree. Motion follows the reduced-motion preference. Groups can be nested.

## API

{% api "mnw-navigation-group" %}
