---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Roadmap
---

# Roadmap and component status

This project is early-stage. The table below separates stable public components from documentation infrastructure and planned improvements.

| Component or area     | Import path                                          | Status             | Notes                                                                                    |
| --------------------- | ---------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Code block            | `material-next-web-components/code-block.js`         | Stable             | Copy-ready code presentation for docs and demos.                                         |
| App showcase          | `material-next-web-components/app-showcase.js`       | Experimental       | Product card layout for promoted app collections.                                        |
| Expressive tab bar    | `material-next-web-components/expressive-tab-bar.js` | Experimental       | Rounded Material navigation tabs.                                                        |
| Home view             | `material-next-web-components/material-next-home.js` | Experimental       | Product-ready landing view; documented as an example, not used as the docs landing page. |
| Docs shell components | `material-next-web-components/docs/docs-page.js`     | Internal candidate | Exported today, but should be reviewed before a public package release.                  |
| API reference         | `/api/`                                              | In progress        | Generated from the custom elements manifest.                                             |
| Mobile navigation     | Docs site                                            | Planned            | Needs a dedicated drawer or overflow strategy as routes grow.                            |

## Next priorities

1. Finalize package publishing and remove ambiguity around npm installation.
2. Stabilize the public component export surface.
3. Improve mobile navigation and route loading states.
4. Expand examples with accessibility, theming, and integration guidance.
