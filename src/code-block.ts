/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/text-button.js';
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

  @queryAssignedNodes({flatten: true})
  private codeNodes!: Node[];

  private get displayCode() {
    return this.code || this.slottedCode;
  }

  override render() {
    return html`
      <slot class="source" @slotchange=${this.syncSlottedCode}></slot>
      <figure class="code-block">
        <figcaption class="header">
          <span class="language">${this.language}</span>
          ${this.copy
            ? html`<md-text-button
                class="copy-button"
                type="button"
                @click=${this.copyCode}
              >
                <md-icon slot="icon"
                  >${this.copied ? 'done' : 'content_copy'}</md-icon
                >
                ${this.copied ? 'Copied' : 'Copy'}
              </md-text-button>`
            : nothing}
        </figcaption>
        <pre><code>${this.displayCode}</code></pre>
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
