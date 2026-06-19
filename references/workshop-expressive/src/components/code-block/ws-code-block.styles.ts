import {css} from 'lit';

export const wsCodeBlockStyles = css`
  :host {
    display: block;
    font-family: var(
      --ws-code-font-family,
      'Google Sans Code',
      ui-monospace,
      monospace
    );
    --ws-color-code-background: #ffffff;
    --ws-color-code-on-background: #0f172a;
    --ws-color-code-border: #e2e8f0;
    --ws-color-code-muted: #64748b;
    --ws-color-code-button: #f1f5f9;
    --ws-color-code-button-hover: #e2e8f0;
    --ws-color-code-token-comment: #64748b;
    --ws-color-code-token-keyword: #7c3aed;
    --ws-color-code-token-string: #047857;
    --ws-color-code-token-number: #c2410c;
    --ws-color-code-token-tag: #2563eb;
    --ws-color-code-token-attr: #be123c;
    --ws-color-code-token-punctuation: #475569;
    --ws-color-code-token-operator: #9333ea;
  }

  :host-context(:root[data-ws-theme='dark']),
  :host-context([data-ws-theme='dark']) {
    --ws-color-code-background: #0f172a;
    --ws-color-code-on-background: #f8fafc;
    --ws-color-code-border: rgb(255 255 255 / 12%);
    --ws-color-code-muted: rgb(255 255 255 / 68%);
    --ws-color-code-button: rgb(255 255 255 / 10%);
    --ws-color-code-button-hover: rgb(255 255 255 / 16%);
    --ws-color-code-token-comment: #94a3b8;
    --ws-color-code-token-keyword: #c4b5fd;
    --ws-color-code-token-string: #86efac;
    --ws-color-code-token-number: #fdba74;
    --ws-color-code-token-tag: #93c5fd;
    --ws-color-code-token-attr: #fda4af;
    --ws-color-code-token-punctuation: #cbd5e1;
    --ws-color-code-token-operator: #f0abfc;
  }

  :host([hidden]) {
    display: none;
  }

  .source {
    display: none;
  }

  .code-block {
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--ws-color-code-border);
    border-radius: var(--ws-shape-large, 12px);
    background: var(--ws-color-code-background);
    box-shadow: var(--ws-elevation-sm, 0 1px 2px rgb(15 23 42 / 8%));
  }

  .header {
    min-height: var(--ws-code-block-header-height, 40px);
    padding: 0 var(--ws-spacing-md, 12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--ws-color-code-border);
  }

  .language {
    color: var(--ws-color-code-muted);
    font: var(--ws-typography-label-small);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  pre {
    margin: 0;
    overflow: auto;
    padding: var(--ws-spacing-lg, 16px);
  }

  code {
    white-space: pre;
    color: var(--ws-color-code-on-background);
    font: var(--ws-typography-code);
  }

  .token.comment {
    color: var(--ws-color-code-token-comment);
  }
  .token.keyword {
    color: var(--ws-color-code-token-keyword);
  }
  .token.string {
    color: var(--ws-color-code-token-string);
  }
  .token.number {
    color: var(--ws-color-code-token-number);
  }
  .token.tag {
    color: var(--ws-color-code-token-tag);
  }
  .token.attr {
    color: var(--ws-color-code-token-attr);
  }
  .token.punctuation {
    color: var(--ws-color-code-token-punctuation);
  }
  .token.operator {
    color: var(--ws-color-code-token-operator);
  }

  .copy-button {
    border: 0;
    border-radius: var(--ws-shape-small, 6px);
    padding: var(--ws-code-copy-padding-block, var(--ws-spacing-xs, 4px))
      var(--ws-code-copy-padding-inline, var(--ws-spacing-md, 12px));
    cursor: pointer;
    color: var(--ws-color-code-on-background);
    background: var(--ws-color-code-button);
    font: var(--ws-typography-label-small);
    transition: background-color var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease);
  }

  .copy-button:focus-visible {
    outline: var(--ws-focus-ring-inner-size, 2px) solid
      var(--ws-color-code-on-background);
    outline-offset: var(--ws-spacing-xs, 4px);
  }

  .copy-button:hover {
    background: var(--ws-color-code-button-hover);
  }

  .copy-button:active {
    transform: scale(0.96);
  }
`;
