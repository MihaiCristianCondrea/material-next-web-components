import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/switch/ws-switch.js';
import type {WsSwitch} from '../components/switch/ws-switch.js';

suite('ws-switch', () => {
  test('is defined', () => {
    const el = document.createElement('ws-switch');
    assert.equal(el.localName, 'ws-switch');
    assert.equal(customElements.get('ws-switch'), el.constructor);
  });

  test('renders an unchecked accessible switch by default', async () => {
    const el = await fixture<WsSwitch>(
      html`<ws-switch aria-label="Theme"></ws-switch>`
    );
    const button = el.shadowRoot!.querySelector('button')!;

    assert.isFalse(el.checked);
    assert.equal(button.getAttribute('role'), 'switch');
    assert.equal(button.getAttribute('aria-checked'), 'false');
    assert.equal(button.getAttribute('aria-label'), 'Theme');
  });

  test('toggles checked and emits change when clicked', async () => {
    const el = await fixture<WsSwitch>(html`<ws-switch></ws-switch>`);
    const eventPromise = oneEvent(el, 'change');

    el.shadowRoot!.querySelector('button')!.click();
    const event = await eventPromise;

    assert.isTrue(el.checked);
    assert.equal(event.type, 'change');
    assert.equal(
      el.shadowRoot!.querySelector('button')!.getAttribute('aria-checked'),
      'true'
    );
  });

  test('does not toggle while disabled', async () => {
    const el = await fixture<WsSwitch>(html`<ws-switch disabled></ws-switch>`);

    el.shadowRoot!.querySelector('button')!.click();

    assert.isFalse(el.checked);
  });

  test('supports checked and unchecked icon slots', async () => {
    const el = await fixture<WsSwitch>(html`
      <ws-switch>
        <span slot="unchecked-icon">sun</span>
        <span slot="checked-icon">moon</span>
      </ws-switch>
    `);

    assert.equal(
      el
        .shadowRoot!.querySelector<HTMLSlotElement>(
          'slot[name="unchecked-icon"]'
        )!
        .assignedElements()[0].textContent,
      'sun'
    );
    assert.equal(
      el
        .shadowRoot!.querySelector<HTMLSlotElement>(
          'slot[name="checked-icon"]'
        )!
        .assignedElements()[0].textContent,
      'moon'
    );
  });
});
