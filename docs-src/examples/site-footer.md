---
tags: reference
name: Site footer
description: 'A rounded copyright bar with optional social links.'
category: components
icon: copyright
status: experimental
tagName: mnw-site-footer
importPath: material-next-web-components/site-footer.js
order: 49
---

## Overview

A shared copyright bar, taken from the Profile website. It follows the host's Material color tokens
and wraps on narrow screens. Its default text is Copyright © 2020–2026, Mihai-Cristian Condrea, with
the last year following the current year. Set `owner`, `start-year` and `end-year` to change it.

{% preview "site-footer" "A copyright bar with accessible social controls." %}

```html
<script type="module">
  import 'material-next-web-components/site-footer.js';
</script>
<mnw-site-footer start-year="2020">
  <a href="https://github.com/MihaiCristianCondrea">GitHub</a>
</mnw-site-footer>
```

Supply links or Material icon buttons through the default slot. Give icon-only controls an accessible
name. With an app shell, put the element in `slot="footer"`; the shell keeps it outside the main
content landmark and makes it inert while its modal drawer covers the page.

## API

{% api "mnw-site-footer" %}
