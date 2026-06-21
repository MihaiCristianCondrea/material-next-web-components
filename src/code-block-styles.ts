/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from code-block.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';

export const styles = css`
:host {
  display: block;
  color: var(--md-sys-color-on-surface, #1d1b20);
  font-family: "Google Sans Code", ui-monospace, monospace;
  font-optical-sizing: auto;
  font-variation-settings: "MONO" 1;
  --mnw-code-background: var(--md-sys-color-code-background, #fffbfe);
  --mnw-code-on-background: var(--md-sys-color-code-on-background, #1d1b20);
  --mnw-code-comment: var(--md-sys-color-code-comment, #6f6676);
  --mnw-code-punctuation: var(--md-sys-color-code-punctuation, #6750a4);
  --mnw-code-tag: var(--md-sys-color-code-tag, #9a3412);
  --mnw-code-string: var(--md-sys-color-code-string, #146c2e);
  --mnw-code-keyword: var(--md-sys-color-code-keyword, #5b43a0);
  --mnw-code-function: var(--md-sys-color-code-function, #984061);
  --mnw-code-variable: var(--md-sys-color-code-variable, #7d5700);
}

@media (prefers-color-scheme: dark) {
  :host {
    --mnw-code-background: var(--md-sys-color-code-background, #17151f);
    --mnw-code-on-background: var(--md-sys-color-code-on-background, #f7f2fa);
    --mnw-code-comment: var(--md-sys-color-code-comment, #b7a9c9);
    --mnw-code-punctuation: var(--md-sys-color-code-punctuation, #d0bcff);
    --mnw-code-tag: var(--md-sys-color-code-tag, #ffb4ab);
    --mnw-code-string: var(--md-sys-color-code-string, #b8f397);
    --mnw-code-keyword: var(--md-sys-color-code-keyword, #d0bcff);
    --mnw-code-function: var(--md-sys-color-code-function, #efb8c8);
    --mnw-code-variable: var(--md-sys-color-code-variable, #fdd663);
  }
}
:host([hidden]) {
  display: none;
}

.source {
  display: none;
}

.code-block {
  display: grid;
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  box-shadow: 0 1px 2px rgba(29, 27, 32, 0.08), 0 2px 6px rgba(29, 27, 32, 0.06);
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
}

.header {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  background: color-mix(in srgb, var(--md-sys-color-primary-container, #eaddff) 36%, transparent);
}

.language {
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-family: "Google Sans Flex", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

pre {
  overflow: auto;
  margin: 0;
  padding: 18px;
  background: var(--mnw-code-background);
}

code {
  color: var(--mnw-code-on-background);
  font-family: "Google Sans Code", ui-monospace, monospace;
  font-optical-sizing: auto;
  font-size: 0.875rem;
  font-variation-settings: "MONO" 1;
  line-height: 1.6;
  white-space: pre;
}

.copy-button {
  --md-assist-chip-container-height: 32px;
  --md-assist-chip-label-text-font: 'Google Sans Flex', system-ui, sans-serif;
  --md-assist-chip-label-text-size: 0.875rem;
  --md-assist-chip-outline-color: var(--md-sys-color-outline-variant, #cac4d0);
  --md-assist-chip-with-icon-icon-color: var(--md-sys-color-primary, #6750a4);
  white-space: nowrap;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: var(--mnw-code-comment);
}

.token.punctuation {
  color: var(--mnw-code-punctuation);
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: var(--mnw-code-tag);
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: var(--mnw-code-string);
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: var(--mnw-code-tag);
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: var(--mnw-code-keyword);
}

.token.function,
.token.class-name {
  color: var(--mnw-code-function);
}

.token.regex,
.token.important,
.token.variable {
  color: var(--mnw-code-variable);
}`;
