import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/code-block/ws-code-block.js';
import type {WsCodeBlock} from '../components/code-block/ws-code-block.js';

suite('ws-code-block', () => {
  test('is defined', () => {
    const el = document.createElement('ws-code-block');
    assert.equal(el.localName, 'ws-code-block');
    assert.equal(customElements.get('ws-code-block'), el.constructor);
  });

  test('renders default content', async () => {
    const code = 'const x = 1;';
    const el = await fixture<WsCodeBlock>(
      html`<ws-code-block language="typescript" .code=${code}></ws-code-block>`
    );

    assert.equal(el.language, 'typescript');
    assert.equal(el.code, code);

    const languageEl = el.shadowRoot!.querySelector('.language')!;
    assert.equal(languageEl.textContent, 'typescript');

    const codeEl = el.shadowRoot!.querySelector('code')!;
    assert.equal(codeEl.textContent, code);

    assert.isNull(el.shadowRoot!.querySelector('.copy-button'));
  });

  test('renders slotted plain text code for declarative usage', async () => {
    const el = await fixture<WsCodeBlock>(html`
      <ws-code-block language="html">
        &lt;ws-button variant="primary"&gt;Continue&lt;/ws-button&gt;
      </ws-code-block>
    `);
    await el.updateComplete;

    assert.include(
      el.shadowRoot!.querySelector('code')!.textContent,
      '<ws-button variant="primary">Continue</ws-button>'
    );
  });

  test('renders template content for declarative HTML examples', async () => {
    const el = await fixture<WsCodeBlock>(html`
      <ws-code-block language="html">
        <template><ws-button variant="primary">Continue</ws-button></template>
      </ws-code-block>
    `);
    await el.updateComplete;

    assert.equal(
      el.shadowRoot!.querySelector('code')!.textContent,
      '<ws-button variant="primary">Continue</ws-button>'
    );
  });


  test('adds syntax token spans for supported languages', async () => {
    const el = await fixture<WsCodeBlock>(
      html`<ws-code-block language="html" code="<ws-button variant='primary'>Create</ws-button>"></ws-code-block>`
    );

    assert.exists(el.shadowRoot!.querySelector('.token.tag'));
    assert.exists(el.shadowRoot!.querySelector('.token.attr'));
    assert.exists(el.shadowRoot!.querySelector('.token.string'));
  });

  test('renders copy button when copy attribute is present', async () => {
    const el = await fixture<WsCodeBlock>(
      html`<ws-code-block copy code="test"></ws-code-block>`
    );
    assert.isTrue(el.copy);
    assert.exists(el.shadowRoot!.querySelector('.copy-button'));
  });

  test('dispatches ws-code-copy event and updates label when clicked', async () => {
    const code = 'npm install lit';
    const el = await fixture<WsCodeBlock>(
      html`<ws-code-block copy .code=${code}></ws-code-block>`
    );
    const copyButton =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.copy-button')!;
    const copyLabel = el.shadowRoot!.querySelector('.copy-label')!;

    assert.equal(copyLabel.textContent?.trim(), 'Copy');

    const eventPromise = oneEvent(el, 'ws-code-copy');

    // Mock clipboard API
    const originalClipboard = navigator.clipboard;
    let copiedText = '';
    (navigator as any).clipboard = {
      writeText: async (text: string) => {
        copiedText = text;
      },
    };

    copyButton.click();

    const event = await eventPromise;
    assert.equal(event.detail.code, code);
    assert.equal(copiedText, code);
    assert.equal(copyLabel.textContent?.trim(), 'Copied');

    // Restore clipboard
    (navigator as any).clipboard = originalClipboard;
  });
});
