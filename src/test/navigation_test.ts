/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../docs-table-of-contents.js';
import '../docs-vertical-tabs.js';
import {toDocsNavigationItems} from '../docs-navigation.js';

suite('docs navigation', () => {
  test('validates navigation item JSON shapes', () => {
    assert.deepEqual(
      toDocsNavigationItems([{label: 'Intro', href: '#intro'}, {label: 'Bad'}]),
      [{label: 'Intro', href: '#intro'}]
    );
  });

  test('table of contents emits navigate', async () => {
    const el = await fixture(
      html`<mnw-docs-table-of-contents
        items-json='[{"label":"Intro","href":"#intro"}]'
      ></mnw-docs-table-of-contents>`
    );
    const event = oneEvent(el, 'navigate');
    el.shadowRoot!.querySelector<HTMLElement>('a')!.click();
    assert.equal((await event).detail.item.href, '#intro');
  });

  test('vertical tabs marks the active item', async () => {
    const el = await fixture(
      html`<mnw-docs-vertical-tabs
        active-index="1"
        items-json='[{"label":"Intro","href":"#intro"},{"label":"API","href":"#api"}]'
      ></mnw-docs-vertical-tabs>`
    );
    const items = el.shadowRoot!.querySelectorAll('md-list-item');
    assert.equal(items[1].getAttribute('aria-current'), 'page');
  });

  test('updates items when items-json changes', async () => {
    const el = await fixture(
      html`<mnw-docs-table-of-contents
        items-json='[{"label":"Intro","href":"#intro"}]'
      ></mnw-docs-table-of-contents>`
    );
    el.setAttribute('items-json', '[{"label":"API","href":"#api"}]');
    await (el as HTMLElement & {updateComplete: Promise<unknown>})
      .updateComplete;
    assert.equal(el.shadowRoot!.querySelector('a')!.textContent, 'API');
  });
});
