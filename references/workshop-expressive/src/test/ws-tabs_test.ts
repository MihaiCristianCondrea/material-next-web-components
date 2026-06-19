import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/tabs/ws-tab.js';
import '../components/tabs/ws-tabs.js';
import type {WsTab} from '../components/tabs/ws-tab.js';
import type {WsTabs} from '../components/tabs/ws-tabs.js';

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

suite('ws-tabs', () => {
  test('renders slotted tabs inside the tablist', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="/" selected>Home</ws-tab>
        <ws-tab href="/api/">API</ws-tab>
      </ws-tabs>
    `);

    assert.equal(
      el.shadowRoot!.querySelector('[role="tablist"]')!.getAttribute('part'),
      'tabs'
    );
    assert.lengthOf(el.querySelectorAll('ws-tab'), 2);
  });

  test('keeps anchor navigation semantics while forwarding selected state', async () => {
    const el = await fixture<WsTab>(html`
      <ws-tab href="/api/" selected>API</ws-tab>
    `);
    const anchor = el.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;

    assert.equal(anchor.getAttribute('href'), '/api/');
    assert.equal(anchor.getAttribute('aria-selected'), 'true');
    assert.equal(anchor.getAttribute('aria-current'), 'page');
    assert.equal(anchor.getAttribute('role'), 'tab');
  });

  test('omits current semantics when a tab is not selected', async () => {
    const el = await fixture<WsTab>(html`
      <ws-tab href="/examples/">Examples</ws-tab>
    `);
    const anchor = el.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;

    assert.equal(anchor.getAttribute('href'), '/examples/');
    assert.equal(anchor.getAttribute('aria-selected'), 'false');
    assert.isFalse(anchor.hasAttribute('aria-current'));
  });

  test('reflects vertical orientation to the tablist', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs orientation="vertical" aria-label="Components">
        <ws-tab href="/examples/" selected>Buttons</ws-tab>
      </ws-tabs>
    `);
    const tablist = el.shadowRoot!.querySelector('[role="tablist"]')!;

    assert.equal(tablist.getAttribute('aria-orientation'), 'vertical');
  });

  test('selects a clicked tab and clears sibling selection', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#overview" selected>Overview</ws-tab>
        <ws-tab href="#settings">Settings</ws-tab>
      </ws-tabs>
    `);
    const [overview, settings] = Array.from(
      el.querySelectorAll<WsTab>('ws-tab')
    );
    const settingsAnchor =
      settings.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;

    settingsAnchor.click();
    await el.updateComplete;
    await overview.updateComplete;
    await settings.updateComplete;

    assert.isFalse(overview.selected);
    assert.isTrue(settings.selected);
  });

  test('only animates the indicator after a user selection change', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#overview" selected>Overview</ws-tab>
        <ws-tab href="#settings">Settings</ws-tab>
      </ws-tabs>
    `);
    const settings = el.querySelectorAll<WsTab>('ws-tab')[1];
    const settingsAnchor =
      settings.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;

    assert.isFalse(el.hasAttribute('indicator-animated'));

    settingsAnchor.click();
    await nextFrame();

    assert.isTrue(el.hasAttribute('indicator-animated'));
  });

  test('animates the indicator when selected state changes externally', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#overview" selected>Overview</ws-tab>
        <ws-tab href="#settings">Settings</ws-tab>
      </ws-tabs>
    `);
    const [overview, settings] = Array.from(
      el.querySelectorAll<WsTab>('ws-tab')
    );

    await nextFrame();
    assert.isFalse(el.hasAttribute('indicator-animated'));

    overview.selected = false;
    settings.selected = true;
    await overview.updateComplete;
    await settings.updateComplete;
    await nextFrame();

    assert.isTrue(el.hasAttribute('indicator-animated'));
  });

  test('keeps indicator animation active until transform finishes', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#overview" selected>Overview</ws-tab>
        <ws-tab href="#settings">Settings</ws-tab>
      </ws-tabs>
    `);
    const indicator = el.shadowRoot!.querySelector<HTMLElement>('.indicator')!;

    el.setAttribute('indicator-animated', '');

    indicator.dispatchEvent(
      new TransitionEvent('transitionend', {propertyName: 'opacity'})
    );
    assert.isTrue(el.hasAttribute('indicator-animated'));

    indicator.dispatchEvent(
      new TransitionEvent('transitionend', {propertyName: 'transform'})
    );
    assert.isFalse(el.hasAttribute('indicator-animated'));
  });

  test('does not animate while repositioning for orientation changes', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#overview" selected>Overview</ws-tab>
        <ws-tab href="#settings">Settings</ws-tab>
      </ws-tabs>
    `);

    await nextFrame();
    el.removeAttribute('indicator-animated');
    el.orientation = 'vertical';
    await el.updateComplete;
    await nextFrame();

    assert.isFalse(el.hasAttribute('indicator-animated'));
    assert.equal(el.getAttribute('orientation'), 'vertical');
  });

  test('ignores clicked tabs that do not belong to the current group', async () => {
    const el = await fixture<WsTabs>(html`
      <ws-tabs>
        <ws-tab href="#outer" selected>Outer</ws-tab>
        <div>
          <ws-tabs>
            <ws-tab href="#inner" selected>Inner</ws-tab>
            <ws-tab href="#inner-two">Inner two</ws-tab>
          </ws-tabs>
        </div>
      </ws-tabs>
    `);
    const outer = el.querySelector<WsTab>('ws-tab')!;
    const nestedSecond = el.querySelectorAll<WsTab>('ws-tab')[2];
    const nestedAnchor =
      nestedSecond.shadowRoot!.querySelector<HTMLAnchorElement>('a')!;

    nestedAnchor.click();
    await el.updateComplete;
    await outer.updateComplete;
    await nestedSecond.updateComplete;

    assert.isTrue(outer.selected);
    assert.isTrue(nestedSecond.selected);
  });
});
