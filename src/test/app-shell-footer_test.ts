import {assert, fixture, oneEvent} from '@open-wc/testing';
import {html} from 'lit';
import {
  type MaterialNextAppShell,
  type MaterialNextAppShellFooter,
} from '../app-shell/index.js';
import '../app-shell/index.js';

suite('mnw-app-shell-footer', () => {
  test('requests a theme and leaves application state with the host', async () => {
    const el = await fixture<MaterialNextAppShellFooter>(
      html`<mnw-app-shell-footer></mnw-app-shell-footer>`
    );
    const request = oneEvent(el, 'theme-change');
    el.shadowRoot!.querySelectorAll<HTMLElement>('md-icon-button')[1].click();
    assert.equal((await request).detail.theme, 'dark');
    assert.equal(el.theme, 'system');
    el.theme = 'dark';
    await el.updateComplete;
    assert.equal(
      el.shadowRoot!.querySelectorAll('md-icon-button[data-active]').length,
      1
    );
  });
  test('a layout switch preserves focus inside the footer control', async () => {
    const shell = await fixture<MaterialNextAppShell>(
      html`<mnw-app-shell heading="Demo" navigation-mode="modal">
        <mnw-navigation-item slot="navigation" href="#demo"
          >Demo</mnw-navigation-item
        >
        <mnw-app-shell-footer slot="navigation-footer"></mnw-app-shell-footer>
      </mnw-app-shell>`
    );
    const footer = shell.querySelector('mnw-app-shell-footer')!;
    await footer.updateComplete;
    shell.openDrawer();
    await shell.updateComplete;
    const button = footer.shadowRoot!.querySelector('md-icon-button')!;
    await button.updateComplete;
    button.focus();
    shell.navigationMode = 'permanent';
    await shell.updateComplete;
    assert.isTrue(footer.shadowRoot!.activeElement === button);
    assert.isTrue(button.shadowRoot!.activeElement !== null);
  });

  test('policy links have quiet link styling and explicit destinations', async () => {
    const el = await fixture<MaterialNextAppShellFooter>(
      html`<mnw-app-shell-footer
        privacy-href="https://example.com/privacy"
        code-of-conduct-href="https://example.com/conduct"
      ></mnw-app-shell-footer>`
    );
    const links = el.shadowRoot!.querySelectorAll('a');
    assert.equal(links.length, 2);
    assert.equal(links[0].textContent, 'Privacy Policy');
    assert.equal(getComputedStyle(links[0]).textDecorationLine, 'none');
  });
});
