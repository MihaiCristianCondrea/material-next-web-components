/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture, oneEvent} from '@open-wc/testing';
import {html} from 'lit';
import {
  appShellLayoutPolicy,
  createLayoutPolicy,
  destinationPath,
  findActiveDestination,
  resolveNavigationMode,
  type MaterialNextAppShell,
  type MaterialNextNavigationItem,
} from '../app-shell/index.js';

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

suite('app shell domain', () => {
  test('a policy resolves the widest rule that fits', () => {
    const policy = appShellLayoutPolicy({permanentFrom: 800});
    assert.equal(resolveNavigationMode(0, policy), 'modal');
    assert.equal(resolveNavigationMode(799, policy), 'modal');
    assert.equal(resolveNavigationMode(800, policy), 'permanent');
    assert.equal(resolveNavigationMode(899), 'modal');
    assert.equal(resolveNavigationMode(900), 'permanent');
  });

  test('createLayoutPolicy sorts, starts at 0 and rejects bad rules', () => {
    const policy = createLayoutPolicy([
      {from: 1200, mode: 'permanent'},
      {from: 600, mode: 'modal'},
    ]);
    assert.deepEqual(
      policy.rules.map((r) => r.from),
      [0, 600, 1200]
    );
    assert.equal(resolveNavigationMode(300, policy), 'modal');
    assert.throws(() => createLayoutPolicy([{from: -1, mode: 'modal'}]));
    assert.throws(() =>
      createLayoutPolicy([{from: 0, mode: 'rail' as 'modal'}])
    );
  });

  test('the longest matching destination is current', () => {
    const destinations = [
      {href: '/admin', match: 'exact' as const},
      {href: '/admin/apps'},
      {href: '/admin/apps/new', match: 'exact' as const},
      {href: '/'},
    ];
    assert.equal(findActiveDestination(destinations, '/admin'), 0);
    assert.equal(findActiveDestination(destinations, '/admin/'), 0);
    assert.equal(findActiveDestination(destinations, '/admin/apps/com.x'), 1);
    assert.equal(findActiveDestination(destinations, '/admin/apps/new'), 2);
    assert.equal(findActiveDestination(destinations, '/admin/other'), -1);
    assert.equal(findActiveDestination(destinations, '/'), 3);
    assert.equal(findActiveDestination(destinations, '/elsewhere'), -1);
    // Relative hrefs resolve against a base, as against <base href>.
    assert.equal(
      findActiveDestination(
        [{href: 'feed/'}, {href: 'lessons/'}],
        '/console/lessons/',
        'https://x.test/console/'
      ),
      1
    );
    assert.equal(destinationPath('https://x.test/a/b/?q#h'), '/a/b');
  });
});

suite('mnw-app-shell', () => {
  const mount = async (width: number, attrs = '') => {
    const host = await fixture<HTMLDivElement>(
      html`<div style="width:${width}px"></div>`
    );
    host.innerHTML = `<mnw-app-shell heading="Feed" active-path="/admin/feed/42" ${attrs}>
      <div slot="brand">Console</div>
      <mnw-navigation-item slot="navigation" href="/admin" match="exact" icon="home">Home</mnw-navigation-item>
      <mnw-navigation-item slot="navigation" href="/admin/feed" icon="dynamic_feed">Feed</mnw-navigation-item>
      <a slot="navigation" href="#local">Local</a>
      <mnw-navigation-item slot="navigation" href="https://example.com/" target="_blank">Docs</mnw-navigation-item>
      <p>Screen</p>
    </mnw-app-shell>`;
    const shell = host.querySelector<MaterialNextAppShell>('mnw-app-shell')!;
    await shell.updateComplete;
    await frame();
    await shell.updateComplete;
    return {host, shell};
  };
  const items = (shell: MaterialNextAppShell) => [
    ...shell.querySelectorAll<MaterialNextNavigationItem>(
      'mnw-navigation-item'
    ),
  ];
  const leading = (shell: MaterialNextAppShell) =>
    shell.shadowRoot!.querySelector<HTMLElement>('.leading');

  test('lays out by its own width and reports switches', async () => {
    const {host, shell} = await mount(1000);
    assert.equal(shell.layout, 'permanent');
    assert.isNull(leading(shell), 'no menu button beside a permanent drawer');
    const changed = oneEvent(shell, 'navigation-mode-change');
    host.style.width = '500px';
    assert.equal((await changed).detail.mode, 'modal');
    await shell.updateComplete;
    assert.equal(shell.getAttribute('layout'), 'modal');
    assert.exists(leading(shell));
  });

  test('permanent-from and navigation-mode override the default', async () => {
    const custom = await mount(850, 'permanent-from="800"');
    assert.equal(custom.shell.layout, 'permanent');
    const forced = await mount(1400, 'navigation-mode="modal"');
    assert.equal(forced.shell.layout, 'modal');
  });

  test('marks the longest matching destination', async () => {
    const {shell} = await mount(1000);
    assert.deepEqual(
      items(shell).map((i) => i.active),
      [false, true, false]
    );
    shell.activePath = '/admin';
    await shell.updateComplete;
    assert.deepEqual(
      items(shell).map((i) => i.active),
      [true, false, false]
    );
    const link = items(shell)[0].shadowRoot!.querySelector('a')!;
    await items(shell)[0].updateComplete;
    assert.equal(link.getAttribute('aria-current'), 'page');
    shell.activePath = '/x/#local';
    await shell.updateComplete;
    assert.equal(
      shell.querySelector('a[slot]')!.getAttribute('aria-current'),
      null
    );
  });

  test('a handled navigation-request keeps the link from navigating', async () => {
    const {shell} = await mount(1000);
    const item = items(shell)[0];
    await item.updateComplete;
    const requested = oneEvent(shell, 'navigation-request');
    shell.addEventListener('navigation-request', (e) => e.preventDefault(), {
      once: true,
    });
    const click = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    item.shadowRoot!.querySelector('a')!.dispatchEvent(click);
    const {detail} = await requested;
    assert.equal(detail.href, '/admin');
    assert.equal(detail.item, item);
    assert.equal(detail.url, new URL('/admin', document.baseURI).href);
    assert.isTrue(click.defaultPrevented);
  });

  test('an unhandled request, a modified click and a new tab are left to the browser', async () => {
    const {shell} = await mount(1000);
    const seen: string[] = [];
    shell.addEventListener('navigation-request', (e) =>
      seen.push(e.detail.href)
    );
    const local = shell.querySelector('a[slot]')!;
    const plain = new MouseEvent('click', {bubbles: true, cancelable: true});
    plain.preventDefault = () => {
      throw new Error('should not be prevented');
    };
    // Prevent the hash change itself only after the shell had its turn.
    local.addEventListener('click', (e) =>
      seen.push(`prevented:${e.defaultPrevented}`)
    );
    local.dispatchEvent(plain);
    const blank = items(shell)[2];
    await blank.updateComplete;
    const tab = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    blank
      .shadowRoot!.querySelector('a')!
      .addEventListener('click', (e) => e.preventDefault());
    blank.shadowRoot!.querySelector('a')!.dispatchEvent(tab);
    const modified = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    local.addEventListener('click', (e) => e.preventDefault());
    local.dispatchEvent(modified);
    assert.deepEqual(seen, ['prevented:false', '#local', 'prevented:false']);
  });

  test('the modal drawer opens, traps the screen and closes on Escape', async () => {
    const {shell} = await mount(500);
    const opened = oneEvent(shell, 'drawer-toggle');
    leading(shell)!.click();
    assert.isTrue((await opened).detail.open);
    await shell.updateComplete;
    const drawer = shell.shadowRoot!.querySelector<HTMLElement>('.drawer')!;
    assert.isTrue(drawer.matches(':popover-open'));
    assert.isTrue(shell.shadowRoot!.querySelector<HTMLElement>('.main')!.inert);
    assert.equal(
      document.activeElement,
      items(shell)[1],
      'focus on the current destination'
    );
    assert.equal(leading(shell)!.getAttribute('aria-expanded'), 'true');
    const closed = oneEvent(shell, 'drawer-toggle');
    drawer.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
    );
    assert.isFalse((await closed).detail.open);
    await shell.updateComplete;
    assert.isFalse(drawer.matches(':popover-open'));
    // Once it has slid out, the closed drawer is not rendered at all.
    await new Promise((r) => setTimeout(r, 400));
    assert.equal(getComputedStyle(drawer).display, 'none');
    assert.equal(
      shell.shadowRoot!.activeElement,
      leading(shell),
      'focus back on the menu button'
    );
  });

  test('a tap on the scrim closes the modal drawer', async () => {
    const {shell} = await mount(500);
    shell.openDrawer();
    await shell.updateComplete;
    // The scrim is not hit-tested; the tap lands on the frame around it.
    shell.shadowRoot!.querySelector<HTMLElement>('.frame')!.click();
    await shell.updateComplete;
    assert.isFalse(shell.drawerOpen);
    // A tap inside the drawer keeps it open.
    shell.openDrawer();
    await shell.updateComplete;
    shell.shadowRoot!.querySelector<HTMLElement>('.brand')!.click();
    await shell.updateComplete;
    assert.isTrue(shell.drawerOpen);
  });

  test('picking a destination closes the modal drawer', async () => {
    const {shell} = await mount(500);
    shell.openDrawer();
    await shell.updateComplete;
    shell.addEventListener('navigation-request', (e) => e.preventDefault());
    items(shell)[0].shadowRoot!.querySelector('a')!.click();
    await shell.updateComplete;
    assert.isFalse(shell.drawerOpen);
    await frame();
    assert.equal(
      shell.shadowRoot!.activeElement?.classList.contains('headline'),
      true,
      'focus on the new screen title'
    );
  });

  test('switching to modal moves focus from the drawer to the menu button', async () => {
    const {shell} = await mount(1000);
    const feed = items(shell)[1];
    feed.focus();
    assert.equal(document.activeElement, feed);
    shell.navigationMode = 'modal';
    await shell.updateComplete;
    await (leading(shell) as HTMLElement & {updateComplete: Promise<unknown>})
      .updateComplete;
    assert.equal(shell.layout, 'modal');
    assert.equal(
      shell.shadowRoot!.activeElement,
      leading(shell),
      'focus did not fall to the body'
    );
  });

  test('switching to permanent keeps focus on the same destination', async () => {
    const {shell} = await mount(1000, 'navigation-mode="modal"');
    const navigation = items(shell);
    shell.openDrawer();
    await shell.updateComplete;
    navigation[0].focus();
    shell.navigationMode = 'auto';
    await shell.updateComplete;
    assert.equal(shell.layout, 'permanent');
    assert.isFalse(shell.drawerOpen);
    // The same nodes, still in the shell, and still focused.
    assert.deepEqual(items(shell), navigation);
    assert.equal(document.activeElement, navigation[0]);
  });

  test('switching keeps screen content in place', async () => {
    const {shell} = await mount(1000);
    const screen = shell.querySelector('p')!;
    shell.navigationMode = 'modal';
    await shell.updateComplete;
    shell.navigationMode = 'auto';
    await shell.updateComplete;
    assert.equal(shell.querySelector('p'), screen);
    assert.isTrue(screen.isConnected);
  });

  test('growing past the breakpoint closes an open drawer', async () => {
    const {host, shell} = await mount(500);
    shell.openDrawer();
    await shell.updateComplete;
    host.style.width = '1000px';
    await oneEvent(shell, 'navigation-mode-change');
    await shell.updateComplete;
    assert.isFalse(shell.drawerOpen);
    shell.openDrawer();
    assert.isFalse(shell.drawerOpen, 'no modal drawer beside a permanent one');
  });

  test('leading="back" fires back-request in every layout', async () => {
    const {shell} = await mount(1000, 'leading="back"');
    const back = oneEvent(shell, 'back-request');
    leading(shell)!.click();
    await back;
    assert.equal(leading(shell)!.getAttribute('aria-label'), 'Back');
  });

  test('reports when content scrolls under the bar', async () => {
    const {shell} = await mount(1000);
    assert.isFalse(shell.scrolled);
    const tall = document.createElement('div');
    tall.style.height = '3000px';
    shell.append(tall);
    window.scrollTo(0, 400);
    for (let i = 0; i < 10 && !shell.scrolled; i++) await frame();
    assert.isTrue(shell.scrolled);
    window.scrollTo(0, 0);
    tall.remove();
  });
});
