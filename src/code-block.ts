/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/chips/assist-chip.js';
import '@material/web/icon/icon.js';
import {LitElement, html, nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
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

  @queryAssignedNodes({flatten: true})
  private codeNodes!: Node[];

  private get displayCode() {
    return this.code || this.slottedCode;
  }

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
        </figcaption>
        <pre><code class="language-${this.normalizedLanguage}">${unsafeHTML(
          this.highlightedCode
        )}</code></pre>
      </figure>
    `;
  }

  private async copyCode() {
    const code = this.displayCode;
    if (!code.trim()) {
      return;
    }

    await navigator.clipboard.writeText(code);
    this.copied = true;
    window.setTimeout(() => {
      this.copied = false;
    }, 1400);
    this.dispatchEvent(
      new CustomEvent('mnw-code-copy', {
        detail: {code},
        bubbles: true,
        composed: true,
      })
    );
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

function highlightCode(code: string, language: string) {
  if (language === 'markup') {
    return highlightMarkup(code);
  }

  return highlightScriptLikeCode(code);
}

function highlightMarkup(code: string) {
  return escapeHtml(code).replace(
    /(&lt;\/?)([\w-]+)([^&]*?)(\/?&gt;)/g,
    (_match, open: string, tag: string, attrs: string, close: string) =>
      `<span class="token punctuation">${open}</span><span class="token tag">${tag}</span>${highlightAttributes(
        attrs
      )}<span class="token punctuation">${close}</span>`
  );
}

function highlightScriptLikeCode(code: string) {
  const tokenPattern =
    /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|return|if|else|class|extends|import|from|export|function|async|await|new|type|interface|private|public|protected|readonly|true|false|null|undefined)\b|\b[A-Z][\w]*\b|\b\d+(?:\.\d+)?\b)/g;
  let highlighted = '';
  let lastIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    highlighted += escapeHtml(code.slice(lastIndex, index));
    highlighted += wrapToken(token, tokenClass(token));
    lastIndex = index + token.length;
  }

  return highlighted + escapeHtml(code.slice(lastIndex));
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

function wrapToken(token: string, className: string) {
  return `<span class="token ${className}">${escapeHtml(token)}</span>`;
}

function highlightAttributes(attributes: string) {
  return attributes.replace(
    /([\w-:]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;|[^\s&]+)/g,
    '<span class="token attr-name">$1</span><span class="token punctuation">$2</span><span class="token attr-value">$3</span>'
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
