/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from hub-document.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:root[data-mnw-hub] {
  color-scheme: light;
  --mnw-hub-bg: #f8f9fb;
  --mnw-hub-surface: #ffffff;
  --mnw-hub-surface-low: #f1f3f6;
  --mnw-hub-surface-high: #e6e9ee;
  --mnw-hub-stage: #edf1f7;
  --mnw-hub-scrolled: rgb(241 243 246 / 0.92);
  --mnw-hub-border: rgb(23 28 36 / 0.1);
  --mnw-hub-border-subtle: rgb(23 28 36 / 0.06);
  --mnw-hub-text: #1b1c1e;
  --mnw-hub-text-variant: #44474c;
  --mnw-hub-text-subtle: #6c7077;
  --mnw-hub-accent: #0b57d0;
  --mnw-hub-on-accent: #ffffff;
  --mnw-hub-accent-container: #d3e3fd;
  --mnw-hub-on-accent-container: #041e49;
  --mnw-hub-shadow-card:
    0 1px 2px rgb(16 32 64 / 0.05), 0 8px 24px rgb(16 32 64 / 0.05);
  --mnw-hub-shadow-raised:
    0 2px 6px rgb(16 32 64 / 0.06), 0 18px 40px rgb(16 32 64 / 0.09);
  --mnw-hub-shadow-device: 0 24px 48px -16px rgb(16 32 64 / 0.22);
  --md-sys-color-primary: #0b57d0;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #d3e3fd;
  --md-sys-color-on-primary-container: #041e49;
  --md-sys-color-secondary-container: #d3e3fd;
  --md-sys-color-on-secondary-container: #041e49;
  --md-sys-color-surface: #ffffff;
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f8f9fb;
  --md-sys-color-surface-container: #f1f3f6;
  --md-sys-color-surface-container-high: #e6e9ee;
  --md-sys-color-surface-container-highest: #dde1e7;
  --md-sys-color-on-surface: #1b1c1e;
  --md-sys-color-on-surface-variant: #44474c;
  --md-sys-color-outline: #74777d;
  --md-sys-color-outline-variant: #c4c7cd;
  --md-sys-color-inverse-surface: #2f3033;
  --md-sys-color-inverse-on-surface: #f1f0f4;
  --mnw-hub-font:
    'Google Sans Flex', 'Google Sans', system-ui, -apple-system, 'Segoe UI',
    sans-serif;
  --mnw-hub-gutter: max(16px, calc((100vw - 1312px) / 2));
  background: var(--mnw-hub-bg);
}

:root[data-mnw-hub][data-mnw-hub-theme=dark] {
  color-scheme: dark;
  --mnw-hub-bg: #0f1215;
  --mnw-hub-surface: #171b20;
  --mnw-hub-surface-low: #13171b;
  --mnw-hub-surface-high: #20262d;
  --mnw-hub-stage: #12171d;
  --mnw-hub-scrolled: rgb(23 27 32 / 0.92);
  --mnw-hub-border: rgb(255 255 255 / 0.09);
  --mnw-hub-border-subtle: rgb(255 255 255 / 0.05);
  --mnw-hub-text: #e3e6ea;
  --mnw-hub-text-variant: #a9b0b9;
  --mnw-hub-text-subtle: #7b838d;
  --mnw-hub-accent: #a8c7fa;
  --mnw-hub-on-accent: #062e6f;
  --mnw-hub-accent-container: #0842a0;
  --mnw-hub-on-accent-container: #d3e3fd;
  --mnw-hub-shadow-card:
    0 1px 2px rgb(0 0 0 / 0.3), 0 8px 24px rgb(0 0 0 / 0.25);
  --mnw-hub-shadow-raised:
    0 2px 6px rgb(0 0 0 / 0.35), 0 18px 40px rgb(0 0 0 / 0.4);
  --mnw-hub-shadow-device: 0 28px 56px -16px rgb(0 0 0 / 0.65);
  --md-sys-color-primary: #a8c7fa;
  --md-sys-color-on-primary: #062e6f;
  --md-sys-color-primary-container: #0842a0;
  --md-sys-color-on-primary-container: #d3e3fd;
  --md-sys-color-secondary-container: #0842a0;
  --md-sys-color-on-secondary-container: #d3e3fd;
  --md-sys-color-surface: #171b20;
  --md-sys-color-surface-container-lowest: #0b0e11;
  --md-sys-color-surface-container-low: #13171b;
  --md-sys-color-surface-container: #1b2026;
  --md-sys-color-surface-container-high: #20262d;
  --md-sys-color-surface-container-highest: #2a3139;
  --md-sys-color-on-surface: #e3e6ea;
  --md-sys-color-on-surface-variant: #a9b0b9;
  --md-sys-color-outline: #8c939c;
  --md-sys-color-outline-variant: #3d444c;
  --md-sys-color-inverse-surface: #e3e6ea;
  --md-sys-color-inverse-on-surface: #2f3033;
}

:root[data-mnw-hub] body {
  margin: 0;
  min-height: 100vh;
  background: var(--mnw-hub-bg);
  color: var(--mnw-hub-text);
  font-family: var(--mnw-hub-font);
  -webkit-font-smoothing: antialiased;
}

.mnw-mount {
  display: block;
  line-height: normal;
}

.mnw-mount--fill {
  width: 100%;
  height: 100%;
}

.mnw-mount--fill > :not(mnw-device-frame) {
  width: 100% !important;
  height: 100% !important;
}

body.mnw-capture {
  width: max-content;
  height: max-content;
  overflow: hidden;
  background: transparent;
}

body.mnw-capture.mnw-capture--framed {
  padding: 48px;
}

.mnw-stage {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.mnw-stage > .mnw-mount:not(.mnw-mount--fill) {
  filter: drop-shadow(var(--mnw-hub-shadow-device));
}

.mnw-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  height: 100%;
}

.mnw-compare__col {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
  padding: 16px;
  border-radius: 28px;
  background: var(--mnw-hub-stage);
  border: 1px solid var(--mnw-hub-border-subtle);
}

.mnw-compare__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 500 14px/20px var(--mnw-hub-font);
  color: var(--mnw-hub-text);
  --md-icon-size: 20px;
}

.mnw-compare__label md-icon {
  color: var(--mnw-hub-accent);
}

@media (max-width: 1000px) {
  .mnw-compare {
    grid-template-columns: minmax(0, 1fr);
  }
}`;
