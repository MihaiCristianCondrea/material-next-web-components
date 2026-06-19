import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

import '../components/breadcrumbs/ws-breadcrumbs.js';
import type {WsBreadcrumbs} from '../components/breadcrumbs/ws-breadcrumbs.js';

suite('ws-breadcrumbs', () => {
  test('parses declarative JSON from the crumbs attribute', async () => {
    const el = await fixture<WsBreadcrumbs>(
      '<ws-breadcrumbs crumbs=\'[{"id":"home","label":"Home","href":"/"},{"id":"docs","label":"Docs"}]\'></ws-breadcrumbs>'
    );

    assert.deepEqual(el.crumbs, [
      {id: 'home', label: 'Home', href: '/'},
      {id: 'docs', label: 'Docs', href: undefined},
    ]);
    assert.lengthOf(el.shadowRoot!.querySelectorAll('a.crumb'), 1);
    assert.equal(
      el.shadowRoot!.querySelector('[aria-current="page"]')!.textContent,
      'Docs'
    );
  });

  test('ignores invalid crumbs JSON declaratively', async () => {
    const el = await fixture<WsBreadcrumbs>(
      '<ws-breadcrumbs crumbs="not json"></ws-breadcrumbs>'
    );

    assert.deepEqual(el.crumbs, []);
    assert.isNull(el.shadowRoot!.querySelector('.breadcrumbs'));
  });

  test('renders links and marks the final crumb as current', async () => {
    const el = await fixture<WsBreadcrumbs>(html`
      <ws-breadcrumbs></ws-breadcrumbs>
    `);
    el.crumbs = [
      {id: 'home', label: 'Home', href: '/'},
      {id: 'components', label: 'Components', href: '/components/'},
      {id: 'tabs', label: 'Tabs'},
    ];
    await el.updateComplete;

    assert.lengthOf(el.shadowRoot!.querySelectorAll('a.crumb'), 2);
    assert.equal(
      el.shadowRoot!.querySelector('[aria-current="page"]')!.textContent,
      'Tabs'
    );
    assert.lengthOf(el.shadowRoot!.querySelectorAll('.separator'), 2);
  });

  test('marks a clicked link crumb as active', async () => {
    const el = await fixture<WsBreadcrumbs>(html`
      <ws-breadcrumbs></ws-breadcrumbs>
    `);
    el.crumbs = [
      {id: 'home', label: 'Home', href: '#home'},
      {id: 'components', label: 'Components'},
    ];
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLAnchorElement>('a.crumb')!.click();
    await el.updateComplete;

    assert.equal(
      el.shadowRoot!.querySelector('a.crumb')!.getAttribute('aria-current'),
      'location'
    );
    assert.isTrue(
      el.shadowRoot!.querySelector('a.crumb')!.classList.contains('active')
    );
  });

  test('prevents placeholder breadcrumb links from scrolling to the top', async () => {
    const el = await fixture<WsBreadcrumbs>(html`
      <ws-breadcrumbs></ws-breadcrumbs>
    `);
    el.crumbs = [
      {id: 'home', label: 'Home', href: '#'},
      {id: 'components', label: 'Components'},
    ];
    await el.updateComplete;
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('a.crumb')!;
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});

    link.dispatchEvent(event);

    assert.isTrue(event.defaultPrevented);
  });
});
