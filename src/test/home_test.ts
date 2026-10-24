/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture} from '@open-wc/testing';
import {html} from 'lit';
import '../material-next-home.js';
import type {MaterialNextHome} from '../material-next-home.js';

suite('mnw-home', () => {
  test('renders the Get started action linking to docs-href', async () => {
    const el = await fixture<MaterialNextHome>(
      html`<mnw-home docs-href="/install/" headline="Docs"></mnw-home>`
    );
    const action = el.shadowRoot!.querySelector(
      '[part="action"]'
    ) as HTMLElement & {href: string};
    assert.exists(action);
    assert.equal(action.href, '/install/');
    assert.equal(el.shadowRoot!.querySelector('h1')?.textContent, 'Docs');
  });
});
