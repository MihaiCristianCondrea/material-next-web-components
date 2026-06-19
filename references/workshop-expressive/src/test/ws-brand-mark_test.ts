import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/brand/ws-brand-mark.js';
import type {WsBrandMark} from '../components/brand/ws-brand-mark.js';

suite('ws-brand-mark', () => {
  test('renders mark text, title, and subtitle', async () => {
    const el = await fixture<WsBrandMark>(html`
      <ws-brand-mark
        mark-text="A"
        title="Atlas"
        subtitle="Expressive UI"
      ></ws-brand-mark>
    `);

    assert.equal(
      el.shadowRoot!.querySelector('.mark')!.textContent!.trim(),
      'A'
    );
    assert.equal(el.shadowRoot!.querySelector('.title')!.textContent, 'Atlas');
    assert.equal(
      el.shadowRoot!.querySelector('.subtitle')!.textContent,
      'Expressive UI'
    );
  });

  test('renders the default logo', async () => {
    const el = await fixture<WsBrandMark>(
      html`<ws-brand-mark></ws-brand-mark>`
    );
    const root = el.shadowRoot!;

    assert.exists(root.querySelector('.logo'));
    assert.lengthOf(root.querySelectorAll('.w-half'), 2);
    assert.lengthOf(root.querySelectorAll('.drop'), 6);
    assert.exists(root.querySelector('.dot'));
  });

  test('keeps the default logo static until animation is requested', async () => {
    const el = await fixture<WsBrandMark>(
      html`<ws-brand-mark></ws-brand-mark>`
    );

    assert.isFalse(el.hasAttribute('animating'));

    el.restartAnimation();

    assert.isTrue(el.hasAttribute('animating'));
  });

  test('can render only the mark', async () => {
    const el = await fixture<WsBrandMark>(html`
      <ws-brand-mark mark-only></ws-brand-mark>
    `);

    assert.isTrue(el.markOnly);
    assert.exists(el.shadowRoot!.querySelector('.mark'));
    assert.notExists(el.shadowRoot!.querySelector('.text'));
  });

  test('applies custom size and gradient tokens', async () => {
    const el = await fixture<WsBrandMark>(html`
      <ws-brand-mark
        size="56px"
        gradient-colors="#111827, #6c5cff"
      ></ws-brand-mark>
    `);
    const root = el.shadowRoot!.querySelector<HTMLElement>('.root')!;

    assert.include(
      root.getAttribute('style') ?? '',
      '--ws-brand-mark-size: 56px'
    );
    assert.include(
      root.getAttribute('style') ?? '',
      '--ws-brand-mark-gradient: linear-gradient(135deg, #111827, #6c5cff)'
    );
  });
});
