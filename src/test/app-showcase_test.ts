/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert, waitUntil} from '@open-wc/testing';
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
    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('md-outlined-card').length === 1,
      'app cards rendered'
    );
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
    await waitUntil(() => calls.includes('https://example.com/gamma.json'));
    await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/delta.json"
      ></mnw-app-showcase>`
    );
    await waitUntil(() => calls.includes('https://example.com/delta.json'));
    assert.sameMembers(calls, [
      'https://example.com/gamma.json',
      'https://example.com/delta.json',
    ]);
  });

  test('ignores stale endpoint responses', async () => {
    const resolvers = new Map<string, (response: Response) => void>();
    window.fetch = (input: RequestInfo | URL) =>
      new Promise<Response>((resolve) => {
        resolvers.set(String(input), resolve);
      });
    const el = await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/slow.json"
      ></mnw-app-showcase>`
    );
    el.setAttribute('apps-endpoint', 'https://example.com/fast.json');
    await waitUntil(() => resolvers.has('https://example.com/fast.json'));
    resolvers.get('https://example.com/fast.json')!(
      new Response(JSON.stringify([app('Fast')]), {status: 200})
    );
    resolvers.get('https://example.com/slow.json')!(
      new Response(JSON.stringify([app('Slow')]), {status: 200})
    );
    await waitUntil(() => el.shadowRoot!.textContent!.includes('Fast'));
    assert.notInclude(el.shadowRoot!.textContent, 'Slow');
  });

  test('normalizes negative limits to an empty state', async () => {
    window.fetch = async () =>
      new Response(JSON.stringify([app('One'), app('Two')]), {status: 200});
    const el = await fixture(
      html`<mnw-app-showcase
        apps-endpoint="https://example.com/negative.json"
        limit="-1"
      ></mnw-app-showcase>`
    );
    await waitUntil(() => el.shadowRoot!.textContent!.includes('No apps'));
    assert.lengthOf(el.shadowRoot!.querySelectorAll('md-outlined-card'), 0);
  });
});
