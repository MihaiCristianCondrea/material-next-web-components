/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../app-showcase.js';

const app = (name: string) => ({
  appName: name,
  packageName: `com.example.${name.toLowerCase()}`,
  category: 'Tools',
  shortDescription: `${name} app`,
  icon: '',
  storeUrl: `https://example.com/${name}`,
});

suite('mnw-app-showcase', () => {
  const originalFetch = window.fetch;

  teardown(() => {
    window.fetch = originalFetch;
  });

  test('renders fetched apps with a limit', async () => {
    window.fetch = async () =>
      new Response(JSON.stringify([app('One'), app('Two')]), {status: 200});
    const el = await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/alpha.json"
        limit="1"
      ></mnw-app-showcase>`
    );
    await new Promise((resolve) => setTimeout(resolve));
    assert.lengthOf(el.shadowRoot!.querySelectorAll('md-outlined-card'), 1);
  });

  test('uses endpoint-specific cache entries', async () => {
    const calls: string[] = [];
    window.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      return new Response(
        JSON.stringify([app(url.includes('delta') ? 'Two' : 'One')]),
        {status: 200}
      );
    };
    await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/gamma.json"
      ></mnw-app-showcase>`
    );
    await new Promise((resolve) => setTimeout(resolve));
    await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/delta.json"
      ></mnw-app-showcase>`
    );
    await new Promise((resolve) => setTimeout(resolve));
    assert.sameMembers(calls, [
      'https://example.com/gamma.json',
      'https://example.com/delta.json',
    ]);
  });
});
