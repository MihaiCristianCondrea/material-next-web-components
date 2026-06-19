import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/app-bar/ws-app-bar.js';
import type {WsAppBar} from '../components/app-bar/ws-app-bar.js';

suite('ws-app-bar', () => {
  test('is defined', () => {
    const el = document.createElement('ws-app-bar');
    assert.equal(el.localName, 'ws-app-bar');
    assert.equal(customElements.get('ws-app-bar'), el.constructor);
  });

  test('renders default and trailing slots', async () => {
    const el = await fixture<WsAppBar>(html`
      <ws-app-bar aria-label="Docs navigation">
        <span>Navigation</span>
        <button slot="trailing">Theme</button>
      </ws-app-bar>
    `);

    assert.equal(el.label, 'Docs navigation');
    assert.equal(
      el.shadowRoot!.querySelector('nav')!.getAttribute('aria-label'),
      'Docs navigation'
    );
    assert.exists(el.shadowRoot!.querySelector('slot:not([name])'));
    assert.exists(el.shadowRoot!.querySelector('slot[name="trailing"]'));
  });

  test('reflects sticky state', async () => {
    const el = await fixture<WsAppBar>(html`<ws-app-bar sticky></ws-app-bar>`);

    assert.isTrue(el.sticky);
    assert.isTrue(el.hasAttribute('sticky'));
  });
});
