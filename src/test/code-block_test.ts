/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../code-block.js';

suite('mnw-code-block', () => {
  test('renders escaped code from the code property', async () => {
    const el = await fixture(
      html`<mnw-code-block
        language="html"
        code="<div>Safe</div>"
      ></mnw-code-block>`
    );
    const code = el.shadowRoot!.querySelector('code')!;
    assert.include(code.textContent, '<div>Safe</div>');
  });

  test('dispatches copy success events', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: async () => undefined},
    });
    const el = await fixture(
      html`<mnw-code-block copy code="const ready = true;"></mnw-code-block>`
    );
    const event = oneEvent(el, 'mnw-code-copy');
    el.shadowRoot!.querySelector<HTMLElement>('md-assist-chip')!.click();
    assert.equal((await event).detail.code, 'const ready = true;');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  test('dispatches copy error events', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: async () => Promise.reject(new Error('blocked'))},
    });
    const el = await fixture(
      html`<mnw-code-block copy code="const ready = true;"></mnw-code-block>`
    );
    const event = oneEvent(el, 'mnw-code-copy-error');
    el.shadowRoot!.querySelector<HTMLElement>('md-assist-chip')!.click();
    assert.equal((await event).detail.code, 'const ready = true;');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });
});
