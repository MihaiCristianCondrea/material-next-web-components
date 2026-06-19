import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/button/ws-button.js';
import type {WsButton} from '../components/button/ws-button.js';

suite('ws-button', () => {
  test('is defined', () => {
    const el = document.createElement('ws-button');
    assert.equal(el.localName, 'ws-button');
    assert.equal(customElements.get('ws-button'), el.constructor);
  });

  test('renders default primary medium button content', async () => {
    const el = await fixture<WsButton>(html`<ws-button>Continue</ws-button>`);

    assert.equal(el.variant, 'primary');
    assert.equal(el.size, 'medium');
    assert.shadowDom.equal(
      el,
      `
        <button class="button" part="button" type="button">
          <span class="label"><slot></slot></span>
        </button>
      `
    );
    assert.isNull(el.shadowRoot!.querySelector('.icon'));
  });

  test('reflects variant and size attributes', async () => {
    const el = await fixture<WsButton>(
      html`<ws-button variant="outlined" size="small">Edit</ws-button>`
    );

    assert.equal(el.getAttribute('variant'), 'outlined');
    assert.equal(el.getAttribute('size'), 'small');
  });

  test('disables the native button when disabled', async () => {
    const el = await fixture<WsButton>(
      html`<ws-button disabled>Disabled</ws-button>`
    );
    const button = el.shadowRoot!.querySelector('button')!;

    assert.isTrue(button.disabled);
  });

  test('shows loading spinner and marks button busy', async () => {
    const el = await fixture<WsButton>(
      html`<ws-button loading>Saving</ws-button>`
    );
    const button = el.shadowRoot!.querySelector('button')!;
    const spinner = el.shadowRoot!.querySelector('.spinner');

    assert.isTrue(button.disabled);
    assert.equal(button.getAttribute('aria-busy'), 'true');
    assert.exists(spinner);
  });

  test('supports icon slot content', async () => {
    const el = await fixture<WsButton>(html`
      <ws-button>
        <span slot="icon">add</span>
        Create
      </ws-button>
    `);
    const iconSlot =
      el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]')!;

    assert.equal(iconSlot.assignedElements()[0].textContent, 'add');
  });

  test('does not reserve icon space when no icon slot is provided', async () => {
    const el = await fixture<WsButton>(html`<ws-button>Centered</ws-button>`);

    assert.isNull(el.shadowRoot!.querySelector('.icon'));
    assert.isFalse(el.hasAttribute('icon-only'));
  });

  test('supports icon-only buttons', async () => {
    const el = await fixture<WsButton>(html`
      <ws-button aria-label="Add">
        <span slot="icon">add</span>
      </ws-button>
    `);

    assert.exists(el.shadowRoot!.querySelector('.icon'));
    assert.isTrue(el.hasAttribute('icon-only'));
  });

  test('emits native click events from the host', async () => {
    const el = await fixture<WsButton>(html`<ws-button>Continue</ws-button>`);
    const eventPromise = oneEvent(el, 'click');

    el.shadowRoot!.querySelector('button')!.click();
    const event = await eventPromise;

    assert.equal(event.type, 'click');
  });
});
