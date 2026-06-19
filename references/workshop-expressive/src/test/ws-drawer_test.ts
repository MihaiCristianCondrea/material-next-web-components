import {fixture, assert, oneEvent} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/drawer/ws-drawer.js';
import '../components/drawer/ws-drawer-item.js';
import type {WsDrawer} from '../components/drawer/ws-drawer.js';
import type {WsDrawerItem} from '../components/drawer/ws-drawer-item.js';

suite('ws-drawer', () => {
  test('renders header, nav content, and footer slots', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <div slot="header">Atlas</div>
        <ws-drawer-item item-id="home" title="Home"></ws-drawer-item>
        <div slot="footer">Version 0.1.0</div>
      </ws-drawer>
    `);

    const headerSlot = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'slot[name="header"]'
    )!;
    const defaultSlot = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'nav slot:not([name])'
    )!;
    const footerSlot = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'slot[name="footer"]'
    )!;

    assert.equal(headerSlot.assignedElements()[0].textContent, 'Atlas');
    assert.equal(defaultSlot.assignedElements()[0].localName, 'ws-drawer-item');
    assert.equal(footerSlot.assignedElements()[0].textContent, 'Version 0.1.0');
  });

  test('syncs selected-item-id to nested drawer items', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer selected-item-id="compose">
        <ws-drawer-item item-id="home" title="Home"></ws-drawer-item>
        <ws-drawer-item item-id="learn" title="Learn" expanded>
          <ws-drawer-item item-id="compose" title="Compose"></ws-drawer-item>
        </ws-drawer-item>
      </ws-drawer>
    `);
    const home = el.querySelector<WsDrawerItem>('[item-id="home"]')!;
    const compose = el.querySelector<WsDrawerItem>('[item-id="compose"]')!;

    await el.updateComplete;

    assert.isFalse(home.selected);
    assert.isTrue(compose.selected);

    el.selectedItemId = 'home';
    await el.updateComplete;

    assert.isTrue(home.selected);
    assert.isFalse(compose.selected);
  });

  test('toggles expansion instead of dispatching when an item has children', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <ws-drawer-item item-id="learn" title="Learn">
          <ws-drawer-item item-id="compose" title="Compose"></ws-drawer-item>
        </ws-drawer-item>
      </ws-drawer>
    `);
    const parent = el.querySelector<WsDrawerItem>('[item-id="learn"]')!;
    let eventCount = 0;
    el.addEventListener('ws-drawer-item-click', () => {
      eventCount += 1;
    });

    parent.shadowRoot!.querySelector<HTMLElement>('.item')!.click();
    await parent.updateComplete;

    assert.isTrue(parent.expanded);
    assert.equal(eventCount, 0);
  });

  test('prevents disabled item activation', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <ws-drawer-item
          item-id="locked"
          title="Locked"
          disabled
        ></ws-drawer-item>
      </ws-drawer>
    `);
    const locked = el.querySelector<WsDrawerItem>('[item-id="locked"]')!;
    let eventCount = 0;
    el.addEventListener('ws-drawer-item-click', () => {
      eventCount += 1;
    });

    locked.shadowRoot!.querySelector<HTMLElement>('.item')!.click();

    assert.equal(eventCount, 0);
  });

  test('dispatches ws-drawer-item-click from the drawer for leaf items', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <ws-drawer-item item-id="dashboard" title="Dashboard"></ws-drawer-item>
      </ws-drawer>
    `);
    const item = el.querySelector<WsDrawerItem>('[item-id="dashboard"]')!;
    const eventPromise = oneEvent(el, 'ws-drawer-item-click');

    item.shadowRoot!.querySelector<HTMLElement>('.item')!.click();
    const event = await eventPromise;

    assert.equal(event.target, el);
    assert.deepEqual(event.detail, {itemId: 'dashboard'});
  });

  test('renders item metadata, icon slot, badge, subtitle, and progress', async () => {
    const item = await fixture<WsDrawerItem>(html`
      <ws-drawer-item
        item-id="course"
        title="Course"
        subtitle="In progress"
        badge="3"
        progress="0.4"
      >
        <i slot="icon" class="ri-graduation-cap-line"></i>
      </ws-drawer-item>
    `);

    assert.equal(
      item.shadowRoot!.querySelector('.title')!.textContent,
      'Course'
    );
    assert.equal(
      item.shadowRoot!.querySelector('.subtitle')!.textContent,
      'In progress'
    );
    assert.equal(item.shadowRoot!.querySelector('.badge')!.textContent, '3');
    assert.equal(
      item
        .shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]')!
        .assignedElements()[0]
        .getAttribute('class'),
      'ri-graduation-cap-line'
    );
    assert.equal(
      item.shadowRoot!.querySelector('.progress-fill')!.getAttribute('style'),
      'inline-size: 40%'
    );
  });

  test('replaces filled progress with a completion icon', async () => {
    const item = await fixture<WsDrawerItem>(html`
      <ws-drawer-item
        item-id="complete"
        title="Complete"
        progress="1"
      ></ws-drawer-item>
    `);

    assert.isNull(item.shadowRoot!.querySelector('.progress-track'));
    assert.isNull(item.shadowRoot!.querySelector('.text .complete-icon'));
    assert.equal(
      item
        .shadowRoot!.querySelector('.item > .complete-icon')!
        .getAttribute('aria-label'),
      'Complete'
    );
  });

  test('supports keyboard activation and visible item navigation', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <ws-drawer-item item-id="home" title="Home"></ws-drawer-item>
        <ws-drawer-item item-id="learn" title="Learn" expanded>
          <ws-drawer-item item-id="compose" title="Compose"></ws-drawer-item>
        </ws-drawer-item>
        <ws-drawer-item item-id="settings" title="Settings"></ws-drawer-item>
      </ws-drawer>
    `);
    const home = el.querySelector<WsDrawerItem>('[item-id="home"]')!;
    const learn = el.querySelector<WsDrawerItem>('[item-id="learn"]')!;
    const compose = el.querySelector<WsDrawerItem>('[item-id="compose"]')!;
    const settings = el.querySelector<WsDrawerItem>('[item-id="settings"]')!;
    const homeButton = home.shadowRoot!.querySelector<HTMLElement>('.item')!;
    const learnButton = learn.shadowRoot!.querySelector<HTMLElement>('.item')!;
    const composeButton =
      compose.shadowRoot!.querySelector<HTMLElement>('.item')!;
    const settingsButton =
      settings.shadowRoot!.querySelector<HTMLElement>('.item')!;
    const eventPromise = oneEvent(el, 'ws-drawer-item-click');

    homeButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})
    );
    const event = await eventPromise;
    assert.deepEqual(event.detail, {itemId: 'home'});

    homeButton.focus();
    homeButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})
    );
    assert.equal(learn.shadowRoot!.activeElement, learnButton);

    learnButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})
    );
    assert.equal(compose.shadowRoot!.activeElement, composeButton);

    composeButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})
    );
    assert.equal(settings.shadowRoot!.activeElement, settingsButton);

    settingsButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true})
    );
    assert.equal(compose.shadowRoot!.activeElement, composeButton);
  });

  test('supports keyboard expansion, collapse, and parent focus', async () => {
    const el = await fixture<WsDrawer>(html`
      <ws-drawer>
        <ws-drawer-item item-id="learn" title="Learn">
          <ws-drawer-item item-id="compose" title="Compose"></ws-drawer-item>
        </ws-drawer-item>
      </ws-drawer>
    `);
    const learn = el.querySelector<WsDrawerItem>('[item-id="learn"]')!;
    const compose = el.querySelector<WsDrawerItem>('[item-id="compose"]')!;
    const learnButton = learn.shadowRoot!.querySelector<HTMLElement>('.item')!;
    const composeButton =
      compose.shadowRoot!.querySelector<HTMLElement>('.item')!;

    learnButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
    );
    await learn.updateComplete;
    assert.isTrue(learn.expanded);

    composeButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true})
    );
    assert.equal(learn.shadowRoot!.activeElement, learnButton);

    learnButton.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true})
    );
    await learn.updateComplete;
    assert.isFalse(learn.expanded);
  });
});
