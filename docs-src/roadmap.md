---
layout: docs.11ty.cjs
sidebar: false
title: Roadmap
heading: Roadmap and status
description: What is stable, what is experimental, and what comes next.
---

## Status of each part

| Part                 | Import path                                          | Status             | Notes                                                                                         |
| -------------------- | ---------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| Code block           | `material-next-web-components/code-block.js`         | Stable             | Breaking changes only in a major version, from the first release.                             |
| Expressive tab bar   | `material-next-web-components/expressive-tab-bar.js` | Experimental       | One sliding selection pill; links or JavaScript routing through `navigate`.                   |
| App showcase         | `material-next-web-components/app-showcase.js`       | Experimental       | Reads any endpoint in the documented shapes.                                                  |
| Home view            | `material-next-web-components/material-next-home.js` | Experimental       | Material Next's own landing view; most copy is fixed.                                         |
| Marketing hub        | `material-next-web-components/marketing.js`          | Experimental       | Elements, controllers, embed API and assets, from Android Insider's and Smart Cleaner's hubs. |
| App shell            | `material-next-web-components/app-shell.js`          | Experimental       | Modal and permanent drawers; the app owns routing. Rail and bottom bar not yet.               |
| Product launcher     | `material-next-web-components/launcher.js`           | Experimental       | Editable favorites in local storage, admin redirects, the author's project catalog.           |
| Documentation layout | `material-next-web-components/docs-*.js`             | Internal candidate | Used by this site; may change before 1.0.                                                     |

## Maturity levels

- **Stable**: documented for production use; breaking changes only in a major version.
- **Experimental**: usable in apps, but names and behaviour can change in a minor version before 1.0. Changes are listed in the changelog.
- **Internal candidate**: exported because this site uses it; review before depending on it.
- **Compatibility alias**: an older name kept working while documentation uses the new one.

## Next

1. Release 0.0.1 to npm, then move Android Insider's and Smart Cleaner's hubs onto `marketing.js`.
2. Move the Android system bars (status bar, gesture and 3-button navigation) that each app's screens draw into the library.
3. Stabilize the marketing elements' names and tokens once two apps use them.
4. Review the documentation layout elements for public use.
