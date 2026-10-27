/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../expressive-tab-bar.js';
import type {MaterialNextExpressiveTabBar} from '../expressive-tab-bar.js';

suite('mnw-expressive-tab-bar', () => {
  test('renders a navigation landmark', async () => {
    const el = await fixture(
      html`<mnw-expressive-tab-bar></mnw-expressive-tab-bar>`
    );
    const nav = el.shadowRoot!.querySelector('nav')!;
    assert.isFalse(nav.hasAttribute('role'));
  });

  test('a full-height pill follows selection and external active-index updates', async () => {
    const el = await fixture<MaterialNextExpressiveTabBar>(
      html`<mnw-expressive-tab-bar></mnw-expressive-tab-bar>`
    );
    assert.equal(el.iconPosition, 'start');
    el.activeIndex = 1;
    await el.updateComplete;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const pill = el.shadowRoot!.querySelector<HTMLElement>('.selection')!;
    await Promise.all(
      pill.getAnimations().map((animation) => animation.finished)
    );
    const selected = el
      .shadowRoot!.querySelectorAll('md-primary-tab')[1]
      .getBoundingClientRect();
    const box = pill.getBoundingClientRect();
    assert.closeTo(box.height, 80, 1);
    assert.closeTo(box.left, selected.left, 1);
    assert.closeTo(box.width, selected.width, 1);
  });

  test('pressing a tab leaves the fill to the sliding pill', async () => {
    const el = await fixture(
      html`<mnw-expressive-tab-bar></mnw-expressive-tab-bar>`
    );
    const tab = el.shadowRoot!.querySelectorAll('md-primary-tab')[1];
    // Material's pressed state layer would fill the tab before the pill
    // arrives and fills it again: the flicker this guards against.
    for (const token of [
      '--md-primary-tab-pressed-state-layer-opacity',
      '--md-primary-tab-active-pressed-state-layer-opacity',
    ]) {
      assert.equal(getComputedStyle(tab).getPropertyValue(token).trim(), '0');
    }
  });

  test('dispatches navigate events when a tab is clicked', async () => {
    const el = await fixture(
      html`<mnw-expressive-tab-bar></mnw-expressive-tab-bar>`
    );
    el.addEventListener('navigate', (event) => event.preventDefault());
    const event = oneEvent(el, 'navigate');
    el.shadowRoot!.querySelector<HTMLElement>('md-primary-tab')!.click();
    assert.equal((await event).detail.index, 0);
  });

  test('registers one element, under the mnw prefix', () => {
    assert.exists(customElements.get('mnw-expressive-tab-bar'));
    assert.notExists(customElements.get('md-expressive-tab-bar'));
  });
});
