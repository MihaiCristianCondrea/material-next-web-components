/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from material-next-home.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: block;
  min-width: 0;
  color: var(--md-sys-color-on-surface, #1d1b20);
  container-type: inline-size;
  font-family: "Google Sans Flex", system-ui, sans-serif;
  font-optical-sizing: auto;
  font-variation-settings: "slnt" 0, "wdth" 100, "GRAD" 0, "ROND" 0;
}

.app-shell {
  min-width: 0;
  min-height: var(--mnw-home-min-height, 100vh);
  overflow: hidden;
  background: linear-gradient(180deg, #fffbff 0%, #f7f2fa 100%);
}

.top-app-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: 16px clamp(16px, 5vw, 64px);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  background: color-mix(in srgb, var(--md-sys-color-surface, #fffbff) 92%, transparent);
  backdrop-filter: blur(18px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.brand span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-mark {
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 14px;
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
}

.view-tabs {
  --mnw-expressive-tab-bar-height: 56px;
  --mnw-expressive-tab-min-width: 132px;
  justify-self: end;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
}

.docs-content {
  padding: clamp(20px, 5vw, 64px);
}

.docs-content:focus {
  outline: none;
}

.home-view,
.example-content {
  display: grid;
  gap: 24px;
}

.info-card,
.example-panel,
.example-nav {
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  border-radius: 28px;
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
  box-shadow: 0 18px 48px rgba(29, 27, 32, 0.08);
}

.page-heading {
  display: grid;
  gap: 12px;
  padding-block: clamp(8px, 2vw, 24px);
}

.eyebrow,
.nav-heading {
  margin: 0;
  color: var(--md-sys-color-primary, #6750a4);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 900px;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 0.95;
}

h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
}

p {
  max-width: 760px;
  font-size: 1rem;
  line-height: 1.65;
}

.tagline {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.info-card,
.example-panel,
.example-nav {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.notice-card {
  background: var(--md-sys-color-tertiary-container, #ffd8e4);
  color: var(--md-sys-color-on-tertiary-container, #31111d);
}

.install-card {
  grid-column: span 2;
}

.examples-view {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(180px, 240px);
  gap: 24px;
  align-items: start;
}

.example-nav,
.toc-nav {
  position: sticky;
  top: 104px;
  align-self: start;
}

.toc-nav {
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  border-radius: 28px;
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
  padding: 24px;
}

.example-content {
  min-width: 0;
}

.example-panel,
.info-card {
  min-width: 0;
  overflow-wrap: anywhere;
}

mnw-code-block,
md-expressive-tab-bar,
mnw-app-showcase {
  max-width: 100%;
  min-width: 0;
}

.example-panel {
  scroll-margin-top: 112px;
}

@media (max-width: 860px) {
  .top-app-bar,
  .examples-view,
  .content-grid {
    grid-template-columns: 1fr;
  }
  .view-tabs {
    justify-self: stretch;
  }
  .install-card {
    grid-column: auto;
  }
  .example-nav,
  .toc-nav {
    position: static;
  }
}
@container (max-width: 640px) {
  .top-app-bar,
  .examples-view,
  .content-grid {
    grid-template-columns: 1fr;
  }
  .top-app-bar {
    position: static;
  }
  .view-tabs {
    justify-self: stretch;
  }
  .install-card {
    grid-column: auto;
  }
  .example-nav,
  .toc-nav {
    position: static;
  }
  h1 {
    font-size: clamp(2rem, 13cqi, 3.5rem);
  }
}`;
