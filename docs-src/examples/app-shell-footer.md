---
tags: reference
name: Drawer footer
description: Theme choices and policy links shared by the app and marketing shells.
category: layout
icon: contrast
status: experimental
tagName: mnw-app-shell-footer
importPath: material-next-web-components/app-shell.js
order: 240
---

## Overview

`<mnw-app-shell-footer>` follows Android Insider and GitHub Dev Tools: a Theme
label, Light/Dark/System icon buttons, then Privacy Policy and Code of Conduct.
Place it in an app shell's `navigation-footer` slot. The host applies and saves
the selected theme. No policy URL is assumed for another product.

```html
<mnw-app-shell-footer
  slot="navigation-footer"
  privacy-href="https://example.com/privacy/"
  code-of-conduct-href="https://example.com/conduct/"
>
</mnw-app-shell-footer>
```

Listen for `theme-change`, apply `event.detail.theme`, and set `footer.theme` to
the new choice. `system` follows the device preference. Both app-shell demos
include a working footer; the marketing gallery connects it to its settings.

## API

{% api "mnw-app-shell-footer" %}
