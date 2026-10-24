/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from marketing-shell.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--mnw-hub-bg);
  color: var(--mnw-hub-text);
  font-family: var(--mnw-hub-font);
}

.skip {
  position: fixed;
  top: 8px;
  left: 16px;
  z-index: 40;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--mnw-hub-surface);
  color: var(--mnw-hub-text);
  box-shadow: var(--mnw-hub-shadow-raised);
  font: 500 14px/20px var(--mnw-hub-font);
  transform: translateY(-160%);
}

.skip:focus {
  transform: none;
  outline: 2px solid var(--mnw-hub-accent);
}

.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 32px;
  padding: 40px var(--mnw-hub-gutter) 24px;
}

.hero__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
}

h1 {
  margin: 0;
  font: 400 clamp(32px, 4vw, 45px)/1.16 var(--mnw-hub-font);
  letter-spacing: -0.25px;
  color: var(--mnw-hub-text);
  text-wrap: balance;
}

.hero p {
  margin: 0;
  max-width: 60ch;
  font: 400 16px/24px var(--mnw-hub-font);
  letter-spacing: 0.15px;
  color: var(--mnw-hub-text-variant);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  --mnw-play-badge-height: 60px;
}

.controls {
  position: sticky;
  top: 64px;
  z-index: 15;
  padding: 12px var(--mnw-hub-gutter);
  background: var(--mnw-hub-scrolled);
  backdrop-filter: saturate(1.2) blur(16px);
  -webkit-backdrop-filter: saturate(1.2) blur(16px);
  box-shadow: inset 0 1px 0 var(--mnw-hub-border-subtle), inset 0 -1px 0 var(--mnw-hub-border-subtle);
}

main {
  flex: 1;
  padding: 28px var(--mnw-hub-gutter) 48px;
  outline: none;
}

.catalog-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  font: 400 24px/32px var(--mnw-hub-font);
  color: var(--mnw-hub-text);
}

.count {
  color: var(--mnw-hub-text-subtle);
}

md-chip-set {
  --md-filter-chip-label-text-font: var(--mnw-hub-font);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
  gap: 24px;
}

.empty {
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 64px 24px;
  border-radius: 28px;
  border: 1px dashed var(--mnw-hub-border);
  color: var(--mnw-hub-text-variant);
  text-align: center;
  font: 400 14px/20px var(--mnw-hub-font);
}

footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 32px;
  padding: 28px var(--mnw-hub-gutter) 36px;
  border-top: 1px solid var(--mnw-hub-border-subtle);
  background: var(--mnw-hub-surface-low);
  color: var(--mnw-hub-text-variant);
  font: 400 13px/20px var(--mnw-hub-font);
}

.footer__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer__product {
  color: var(--mnw-hub-text);
  font-weight: 500;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
}

footer a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--mnw-hub-accent);
  text-decoration: none;
  border-radius: 4px;
  --md-icon-size: 18px;
}

footer a:hover {
  text-decoration: underline;
}

footer a:focus-visible {
  outline: 2px solid var(--mnw-hub-accent);
  outline-offset: 2px;
}

.trademark {
  flex-basis: 100%;
  color: var(--mnw-hub-text-subtle);
  font-size: 12px;
}

@media (max-width: 600px) {
  .hero {
    padding-top: 28px;
    padding-bottom: 20px;
  }
  .hero__actions {
    --mnw-play-badge-height: 54px;
  }
  .controls {
    position: static;
  }
  main {
    padding-top: 20px;
  }
}
::slotted([slot=extra]) {
  display: block;
  padding: 0 var(--mnw-hub-gutter) 48px;
}`;
