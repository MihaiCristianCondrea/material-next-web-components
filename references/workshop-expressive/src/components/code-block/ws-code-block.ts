import {LitElement, html, nothing} from 'lit';
import {
  customElement,
  property,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';

import {wsCodeBlockStyles} from './ws-code-block.styles.js';

type HighlightToken = {
  kind?:
    | 'comment'
    | 'keyword'
    | 'number'
    | 'operator'
    | 'punctuation'
    | 'string'
    | 'tag'
    | 'attr';
  text: string;
};

/**
 * A component for displaying code snippets with an optional copy-to-clipboard button.
 *
 * @fires ws-code-copy - Dispatched when the code is copied to the clipboard.
 */
@customElement('ws-code-block')
export class WsCodeBlock extends LitElement {
  static override styles = wsCodeBlockStyles;

  /** The programming language of the code snippet. */
  @property({type: String})
  language = 'text';

  /** The code snippet to display. */
  @property({type: String})
  code = '';

  /** Whether to show a copy-to-clipboard button. */
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

  private async copyCode() {
    const code = this.displayCode;
    if (!code.trim()) return;

    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;

      window.setTimeout(() => {
        this.copied = false;
      }, 1400);

      this.dispatchEvent(
        new CustomEvent('ws-code-copy', {
          detail: {code},
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  }

  override render() {
    const code = this.displayCode;

    return html`
      <slot class="source" @slotchange=${this.syncSlottedCode}></slot>
      <figure class="code-block">
        <figcaption class="header">
          <span class="language">${this.language}</span>

          ${this.copy
            ? html`
                <button
                  class="copy-button"
                  type="button"
                  @click=${this.copyCode}
                >
                  <span class="copy-label">
                    ${this.copied ? 'Copied' : 'Copy'}
                  </span>
                </button>
              `
            : nothing}
        </figcaption>

        <pre><code>${this.renderHighlightedCode(code)}</code></pre>
      </figure>
    `;
  }

  private renderHighlightedCode(code: string) {
    return this.tokenize(code).map((token) =>
      token.kind
        ? html`<span class="token ${token.kind}">${token.text}</span>`
        : html`${token.text}`
    );
  }

  private tokenize(code: string): HighlightToken[] {
    if (!code) return [];

    if (['html', 'xml', 'svg'].includes(this.language.toLowerCase())) {
      return this.tokenizeMarkup(code);
    }

    if (
      ['js', 'javascript', 'ts', 'typescript', 'css'].includes(
        this.language.toLowerCase()
      )
    ) {
      return this.tokenizeScript(code);
    }

    return [{text: code}];
  }

  private tokenizeMarkup(code: string): HighlightToken[] {
    const tokens: HighlightToken[] = [];
    const pattern =
      /(<!--[\s\S]*?-->|<\/?[\w:-]+|\/?\s*>|[\w:-]+(?==)|"[^"]*"|'[^']*')/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(code))) {
      if (match.index > lastIndex) {
        tokens.push({text: code.slice(lastIndex, match.index)});
      }

      const text = match[0];
      let kind: HighlightToken['kind'] = 'punctuation';
      if (text.startsWith('<!--')) kind = 'comment';
      else if (text.startsWith('<')) kind = 'tag';
      else if (text.startsWith('"') || text.startsWith("'")) kind = 'string';
      else if (!/[<>]/.test(text)) kind = 'attr';

      tokens.push({kind, text});
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < code.length) tokens.push({text: code.slice(lastIndex)});
    return tokens;
  }

  private tokenizeScript(code: string): HighlightToken[] {
    const tokens: HighlightToken[] = [];
    const pattern =
      /(\/\*[\s\S]*?\*\/|\/\/.*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|type|new|await|async|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:]|[-+*/%=!<>|&?]+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(code))) {
      if (match.index > lastIndex) {
        tokens.push({text: code.slice(lastIndex, match.index)});
      }

      const text = match[0];
      let kind: HighlightToken['kind'] = 'operator';
      if (text.startsWith('//') || text.startsWith('/*')) kind = 'comment';
      else if (/^["'`]/.test(text)) kind = 'string';
      else if (/^\d/.test(text)) kind = 'number';
      else if (/^[{}()[\].,;:]$/.test(text)) kind = 'punctuation';
      else if (/^[a-z]/.test(text)) kind = 'keyword';

      tokens.push({kind, text});
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < code.length) tokens.push({text: code.slice(lastIndex)});
    return tokens;
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
    'ws-code-block': WsCodeBlock;
  }
}
