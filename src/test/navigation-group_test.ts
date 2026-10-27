import {assert, fixture} from '@open-wc/testing';
import {html} from 'lit';
import {
  findActiveDestination,
  type MaterialNextAppShell,
  type MaterialNextNavigationGroup,
} from '../app-shell/index.js';
import '../site-footer.js';
import type {MaterialNextSiteFooter} from '../site-footer.js';

suite('drawer categories and copyright footer', () => {
  test('collapsing a category preserves its content and updates accessibility state', async () => {
    const group = await fixture<MaterialNextNavigationGroup>(
      html`<mnw-navigation-group label="Profile" icon="person"
        ><input value="Unsaved text"
      /></mnw-navigation-group>`
    );
    const input = group.querySelector('input')!;
    const button = group.shadowRoot!.querySelector('button')!;
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.isTrue(
      (group.shadowRoot!.querySelector('.children') as HTMLElement).inert
    );
    button.click();
    await group.updateComplete;
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    input.value = 'Kept';
    button.click();
    await group.updateComplete;
    button.click();
    await group.updateComplete;
    assert.strictEqual(group.querySelector('input'), input);
    assert.equal(input.value, 'Kept');
  });

  test('a modal drawer reveals and focuses an active destination inside a collapsed category', async () => {
    const shell = await fixture<MaterialNextAppShell>(
      html`<mnw-app-shell navigation-mode="modal" active-path="#about"
        ><mnw-navigation-group slot="navigation" label="Profile"
          ><mnw-navigation-item href="#about"
            >About</mnw-navigation-item
          ></mnw-navigation-group
        >
        <div>Screen</div></mnw-app-shell
      >`
    );
    const group = shell.querySelector('mnw-navigation-group')!;
    await new Promise(requestAnimationFrame);
    group.open = false;
    await group.updateComplete;
    shell.openDrawer();
    await shell.updateComplete;
    await new Promise(requestAnimationFrame);
    assert.isTrue(group.open);
    assert.isTrue(shell.querySelector('mnw-navigation-item')!.active);
    assert.equal(document.activeElement?.localName, 'mnw-navigation-item');
    shell.closeDrawer();
    await shell.updateComplete;
  });

  test('hash routes select their own destination and ignore another origin', () => {
    const items = [
      {href: '#home'},
      {href: '#projects'},
      {href: 'https://elsewhere.example/#projects'},
    ];
    assert.equal(
      findActiveDestination(
        items,
        '#projects',
        'https://site.example/profile/'
      ),
      1
    );
    assert.equal(
      findActiveDestination(
        items,
        '#projects/detail',
        'https://site.example/profile/'
      ),
      1
    );
    assert.equal(
      findActiveDestination(items, '#missing', 'https://site.example/profile/'),
      -1
    );
  });

  test('footer shows the requested copyright range and preserves social controls', async () => {
    const el = await fixture<MaterialNextSiteFooter>(
      html`<mnw-site-footer start-year="2020" end-year="2026"
        ><a href="https://github.com/" aria-label="GitHub"
          >GitHub</a
        ></mnw-site-footer
      >`
    );
    await new Promise(requestAnimationFrame);
    assert.include(
      el.shadowRoot!.textContent!,
      'Copyright © 2020–2026, Mihai-Cristian Condrea'
    );
    assert.isFalse(el.shadowRoot!.querySelector('nav')!.hidden);
    assert.equal(el.querySelector('a')?.getAttribute('aria-label'), 'GitHub');
  });
});
