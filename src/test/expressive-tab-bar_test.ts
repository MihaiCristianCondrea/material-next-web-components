/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../expressive-tab-bar.js';

suite('md-expressive-tab-bar', () => {
  test('renders a navigation landmark', async () => {
    const el = await fixture(
      html`<md-expressive-tab-bar></md-expressive-tab-bar>`
    );
    const nav = el.shadowRoot!.querySelector('nav')!;
    assert.isFalse(nav.hasAttribute('role'));
  });

  test('dispatches navigate events when a tab is clicked', async () => {
    const el = await fixture(
      html`<md-expressive-tab-bar></md-expressive-tab-bar>`
    );
    const event = oneEvent(el, 'navigate');
    el.shadowRoot!.querySelector<HTMLElement>('md-primary-tab')!.click();
    assert.equal((await event).detail.index, 0);
  });
});
