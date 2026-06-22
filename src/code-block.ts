/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/chips/assist-chip.js';
import '@material/web/icon/icon.js';
import {LitElement, html, nothing} from 'lit';
import {
  customElement,
  property,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import {styles} from './code-block-styles.js';

/** A Material code block with Google Sans Code typography and copy action. */
@customElement('mnw-code-block')
export class MaterialNextCodeBlock extends LitElement {
  static override styles = styles;

  /** The programming language label displayed in the block header. */
  @property()
  language = 'text';

  /** The code snippet to render. Slotted content is used when omitted. */
  @property()
  code = '';

  /** Shows the Material copy-to-clipboard action. */
  @property({type: Boolean, reflect: true})
  copy = false;

  @state()
  private copied = false;

  @state()
  private slottedCode = '';

  @state()
  private copyStatus = '';

  @queryAssignedNodes({flatten: true})
  private codeNodes!: Node[];

  private get displayCode() {
    return this.code || this.slottedCode;
  }

  private copyResetTimeout?: number;

  private get highlightedCode() {
    const code = this.displayCode;
    return highlightCode(code, this.normalizedLanguage);
  }

  private get normalizedLanguage() {
    const language = this.language.toLowerCase().trim();
    if (language === 'html') {
      return 'markup';
    }
    if (language === 'js') {
      return 'javascript';
    }
    if (language === 'ts') {
      return 'typescript';
    }
    return language;
  }

  override render() {
    return html`
      <slot class="source" @slotchange=${this.syncSlottedCode}></slot>
      <figure class="code-block">
        <figcaption class="header">
          <span class="language">${this.language}</span>
          ${this.copy
            ? html`<md-assist-chip
                class="copy-button"
                label=${this.copied ? 'Copied' : 'Copy'}
                @click=${this.copyCode}
              >
                <md-icon slot="icon"
                  >${this.copied ? 'done' : 'content_copy'}</md-icon
                >
              </md-assist-chip>`
            : nothing}
          <span class="copy-status" aria-live="polite">${this.copyStatus}</span>
        </figcaption>
        <pre><code class="language-${this
          .normalizedLanguage}">${this.highlightedCode.map((token) =>
          token.className
            ? html`<span class="token ${token.className}">${token.text}</span>`
            : token.text
        )}</code></pre>
      </figure>
    `;
  }

  private async copyCode() {
    const code = this.displayCode;
    if (!code.trim()) {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is unavailable.');
      }
      await navigator.clipboard.writeText(code);
    } catch (error) {
      this.copyStatus = 'Copy failed';
      this.dispatchEvent(
        new CustomEvent('mnw-code-copy-error', {
          detail: {code, error},
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    this.copied = true;
    this.copyStatus = 'Copied';
    if (this.copyResetTimeout !== undefined) {
      window.clearTimeout(this.copyResetTimeout);
    }
    this.copyResetTimeout = window.setTimeout(() => {
      this.copied = false;
      this.copyStatus = '';
      this.copyResetTimeout = undefined;
    }, 1400);
    this.dispatchEvent(
      new CustomEvent('mnw-code-copy', {
        detail: {code},
        bubbles: true,
        composed: true,
      })
    );
  }

  override disconnectedCallback() {
    if (this.copyResetTimeout !== undefined) {
      window.clearTimeout(this.copyResetTimeout);
      this.copyResetTimeout = undefined;
    }
    super.disconnectedCallback();
  }

  private syncSlottedCode() {
    const code = this.codeNodes
      .map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent ?? '';
        }
        if (node instanceof HTMLTemplateElement) {
          return node.innerHTML;
        }
        if (node instanceof Element) {
          return node.outerHTML;
        }
        return '';
      })
      .join('')
      .replace(/^\n|\n$/g, '');

    if (this.slottedCode !== code) {
      this.slottedCode = code;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-code-block': MaterialNextCodeBlock;
  }
}

interface HighlightToken {
  text: string;
  className?: string;
}

function highlightCode(code: string, language: string): HighlightToken[] {
  if (language === 'markup') {
    return highlightMarkup(code);
  }

  return highlightScriptLikeCode(code);
}

function highlightMarkup(code: string): HighlightToken[] {
  const tagPattern = /(<\/?)([\w-]+)([^<>]*?)(\/?>)/g;
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(tagPattern)) {
    const index = match.index ?? 0;
    pushText(tokens, code.slice(lastIndex, index));
    tokens.push({text: match[1], className: 'punctuation'});
    tokens.push({text: match[2], className: 'tag'});
    tokens.push(...highlightAttributes(match[3]));
    tokens.push({text: match[4], className: 'punctuation'});
    lastIndex = index + match[0].length;
  }

  pushText(tokens, code.slice(lastIndex));
  return tokens;
}

function highlightScriptLikeCode(code: string): HighlightToken[] {
  const tokenPattern =
    /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|return|if|else|class|extends|import|from|export|function|async|await|new|type|interface|private|public|protected|readonly|true|false|null|undefined)\b|\b[A-Z][\w]*\b|\b\d+(?:\.\d+)?\b)/g;
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    pushText(tokens, code.slice(lastIndex, index));
    tokens.push({text: token, className: tokenClass(token)});
    lastIndex = index + token.length;
  }

  pushText(tokens, code.slice(lastIndex));
  return tokens;
}

function pushText(tokens: HighlightToken[], text: string) {
  if (text) {
    tokens.push({text});
  }
}

function tokenClass(token: string) {
  if (token.startsWith('//') || token.startsWith('/*')) {
    return 'comment';
  }
  if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
    return 'string';
  }
  if (/^\d/.test(token)) {
    return 'number';
  }
  if (/^[A-Z]/.test(token)) {
    return 'class-name';
  }
  return 'keyword';
}

function highlightAttributes(attributes: string): HighlightToken[] {
  const attrPattern = /([\w-:]+)(=)(".*?"|'.*?'|[^\s]+)/g;
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;

  for (const match of attributes.matchAll(attrPattern)) {
    const index = match.index ?? 0;
    pushText(tokens, attributes.slice(lastIndex, index));
    tokens.push({text: match[1], className: 'attr-name'});
    tokens.push({text: match[2], className: 'punctuation'});
    tokens.push({text: match[3], className: 'attr-value'});
    lastIndex = index + match[0].length;
  }

  pushText(tokens, attributes.slice(lastIndex));
  return tokens;
}
