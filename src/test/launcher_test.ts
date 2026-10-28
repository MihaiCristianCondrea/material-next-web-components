/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {assert, fixture, oneEvent} from '@open-wc/testing';
import {html} from 'lit';
import {configureMarketingAssets} from '../marketing/index.js';
import {
  addFavorite,
  createLauncherCatalog,
  createLauncherPreferenceStore,
  isLauncherItemId,
  launcherItem,
  moveFavorite,
  normalizeFavoriteIds,
  removeFavorite,
  resolveLauncher,
  migrateLegacyLauncherId,
  PROJECT_LAUNCHER_CATALOG,
  type KeyValueStorage,
  type LauncherItemId,
  type MaterialNextProductLauncher,
} from '../launcher/index.js';

configureMarketingAssets({base: '/assets/marketing/'});

const memoryStorage = (): KeyValueStorage & {data: Map<string, string>} => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const catalog = createLauncherCatalog({
  items: [
    {
      kind: 'android-app',
      key: 'notes',
      title: 'Notes',
      href: 'https://play.example/notes',
      product: 'notes',
    },
    {
      kind: 'web',
      key: 'notes',
      title: 'Notes site',
      href: 'https://notes.example/',
      product: 'notes',
    },
    {
      kind: 'shortcut',
      key: 'profile',
      title: 'Profile',
      href: 'https://code.example/me',
    },
    {
      kind: 'web',
      key: 'repo',
      title: 'Repo',
      href: 'https://code.example/me/repo',
    },
    {
      kind: 'console',
      key: 'play',
      title: 'Play',
      href: 'https://console.example/',
    },
    // Duplicates: same id, then same URL.
    {
      kind: 'shortcut',
      key: 'profile',
      title: 'Profile 2',
      href: 'https://x.example/',
    },
    {
      kind: 'shortcut',
      key: 'me',
      title: 'Me',
      href: 'https://code.example/me/#about',
    },
  ],
  defaultFavorites: [
    'android-app:notes',
    'shortcut:profile',
    'web:repo',
    'web:missing',
  ],
  redirects: ['console:play'],
});

suite('launcher domain', () => {
  test('ids are type-aware and validated', () => {
    assert.equal(
      launcherItem({kind: 'web', key: 'a.b-c', title: 'A', href: '/'}).id,
      'web:a.b-c'
    );
    assert.isTrue(isLauncherItemId('android-app:notes'));
    assert.isFalse(isLauncherItemId('notes'));
    assert.isFalse(isLauncherItemId('desktop:notes'));
    assert.isFalse(isLauncherItemId('web:Bad Key'));
    assert.throws(() =>
      launcherItem({kind: 'web', key: 'Bad', title: '', href: '/'})
    );
  });

  test('the catalog deduplicates by id and URL and drops unknown defaults', () => {
    assert.deepEqual(
      catalog.items.map((i) => i.id),
      [
        'android-app:notes',
        'web:notes',
        'shortcut:profile',
        'web:repo',
        'console:play',
      ]
    );
    assert.equal(catalog.items[2].title, 'Profile');
    assert.deepEqual(catalog.defaultFavorites, [
      'android-app:notes',
      'shortcut:profile',
      'web:repo',
    ]);
  });

  test('listings that differ only in their query are kept apart', () => {
    const play = 'https://play.google.com/store/apps/details?id=';
    const apps = createLauncherCatalog({
      items: [
        {kind: 'android-app', key: 'a', title: 'A', href: `${play}com.a`},
        {kind: 'android-app', key: 'b', title: 'B', href: `${play}com.b`},
      ],
    });
    assert.lengthOf(apps.items, 2);
    assert.lengthOf(PROJECT_LAUNCHER_CATALOG.items, 9);
  });

  test('the default catalog favors both admin consoles and drops App Toolkit', () => {
    assert.deepEqual(PROJECT_LAUNCHER_CATALOG.defaultFavorites.slice(0, 2), [
      'console:tutorials-admin',
      'console:apps-metadata',
    ]);
    const metadata = PROJECT_LAUNCHER_CATALOG.items.find(
      (item) => item.id === 'console:apps-metadata'
    )!;
    assert.equal(metadata.title, 'Apps Metadata Admin Console');
    assert.equal(metadata.image, 'asset:launcher/apps-metadata.svg');
    assert.notExists(
      PROJECT_LAUNCHER_CATALOG.items.find(
        (item) => item.id === 'web:app-toolkit'
      )
    );
  });

  test('the current product, exclusions and the page URL hide entries', () => {
    const ids = catalog.defaultFavorites;
    const byProduct = resolveLauncher(catalog, ids, {currentProduct: 'notes'});
    assert.deepEqual(
      byProduct.favorites.map((i) => i.id),
      ['shortcut:profile', 'web:repo']
    );
    assert.deepEqual(byProduct.hiddenFavoriteIds, ['android-app:notes']);
    assert.notInclude(
      byProduct.available.map((i) => i.id),
      'web:notes'
    );

    const byId = resolveLauncher(catalog, ids, {
      currentProduct: 'web:repo',
      exclude: ['console:play'],
    });
    assert.deepEqual(
      byId.favorites.map((i) => i.id),
      ['android-app:notes', 'shortcut:profile']
    );
    assert.deepEqual(byId.redirects, []);

    // A web product owns pages under it; a shortcut (the profile) does not.
    const byUrl = resolveLauncher(catalog, ids, {
      currentUrl: 'https://code.example/me/repo/issues?q=1',
    });
    assert.deepEqual(
      byUrl.favorites.map((i) => i.id),
      ['android-app:notes', 'shortcut:profile']
    );
    const exact = resolveLauncher(catalog, ids, {
      currentUrl: 'https://code.example/me/#top',
    });
    assert.notInclude(
      exact.favorites.map((i) => i.id),
      'shortcut:profile'
    );
  });

  test('available lists entries in neither favorites nor redirects', () => {
    const view = resolveLauncher(catalog, ['shortcut:profile']);
    assert.deepEqual(
      view.available.map((i) => i.id),
      ['android-app:notes', 'web:notes', 'web:repo']
    );
  });

  test('add, remove and move keep hidden favorites in place', () => {
    const ids: LauncherItemId[] = [
      'android-app:notes',
      'shortcut:profile',
      'web:gone',
      'web:repo',
    ];
    assert.deepEqual(addFavorite(ids, 'shortcut:profile'), ids);
    assert.deepEqual(
      addFavorite(ids, 'console:play')[ids.length],
      'console:play'
    );
    assert.deepEqual(removeFavorite(ids, 'shortcut:profile'), [
      'android-app:notes',
      'web:gone',
      'web:repo',
    ]);
    const visible: LauncherItemId[] = [
      'android-app:notes',
      'shortcut:profile',
      'web:repo',
    ];
    assert.deepEqual(moveFavorite(ids, 'web:repo', 0, visible), [
      'web:repo',
      'android-app:notes',
      'web:gone',
      'shortcut:profile',
    ]);
    assert.deepEqual(moveFavorite(ids, 'android-app:notes', 99, visible), [
      'shortcut:profile',
      'web:repo',
      'web:gone',
      'android-app:notes',
    ]);
    assert.deepEqual(moveFavorite(ids, 'web:gone', 0, visible), ids);
  });

  test('normalize keeps well-formed unknown ids, dedupes, migrates and caps', () => {
    assert.deepEqual(normalizeFavoriteIds('nope', ['web:a']), ['web:a']);
    assert.deepEqual(
      normalizeFavoriteIds(
        ['web:x', 'web:x', 3, 'bad', 'github-profile'],
        [],
        migrateLegacyLauncherId
      ),
      ['web:x', 'shortcut:github']
    );
    assert.lengthOf(
      normalizeFavoriteIds(
        Array.from({length: 80}, (_, i) => `web:k${i}`),
        []
      ),
      48
    );
  });

  test('the project catalog omits removed products and keeps admin redirects', () => {
    assert.includeMembers(
      [...PROJECT_LAUNCHER_CATALOG.defaultFavorites],
      [
        'console:tutorials-admin',
        'shortcut:github',
        'shortcut:google-play',
        'web:material-next',
      ]
    );
    for (const id of [
      'shortcut:codex',
      'android-app:smart-cleaner',
      'android-app:android-insider',
    ]) {
      assert.notInclude(
        PROJECT_LAUNCHER_CATALOG.items.map((item) => item.id),
        id
      );
      assert.notInclude(PROJECT_LAUNCHER_CATALOG.defaultFavorites, id);
    }
    assert.equal(
      PROJECT_LAUNCHER_CATALOG.items.find(
        (item) => item.id === 'console:tutorials-admin'
      )?.title,
      'Android Insider Admin Console'
    );
    const insider = PROJECT_LAUNCHER_CATALOG.items.filter((item) =>
      item.title.includes('Insider')
    );
    assert.lengthOf(insider, 1);
    assert.equal(
      insider[0].href,
      'https://android-insider-backend.mihaicristiancondrea.workers.dev/admin/'
    );
    const play = PROJECT_LAUNCHER_CATALOG.items.find(
      (item) => item.id === 'shortcut:google-play'
    )!;
    assert.equal(
      play.href,
      'https://play.google.com/store/apps/dev?id=5390214922640123642'
    );
    assert.equal(play.image, 'asset:launcher/google-play.svg');
    assert.deepEqual(
      [...PROJECT_LAUNCHER_CATALOG.redirects],
      [
        'console:play-console',
        'console:firebase',
        'console:admob',
        'console:cloudflare',
      ]
    );
  });
});

suite('launcher storage', () => {
  test('saves versioned JSON and reads it back', () => {
    const storage = memoryStorage();
    const store = createLauncherPreferenceStore({
      defaults: ['web:a'],
      key: 'k',
      storage,
    });
    assert.deepEqual(store.load(), ['web:a']);
    store.save(['web:b', 'shortcut:c']);
    assert.deepEqual(JSON.parse(storage.data.get('k')!), {
      version: 1,
      favoriteIds: ['web:b', 'shortcut:c'],
    });
    assert.deepEqual(store.load(), ['web:b', 'shortcut:c']);
    store.reset();
    assert.isFalse(storage.data.has('k'));
    assert.deepEqual(store.load(), ['web:a']);
  });

  test('reads legacy shapes and survives corrupt or failing storage', () => {
    const storage = memoryStorage();
    const store = createLauncherPreferenceStore({
      defaults: ['web:a'],
      key: 'k',
      storage,
      migrate: migrateLegacyLauncherId,
    });
    storage.data.set('k', JSON.stringify({favoriteIds: ['codex', 'admob']}));
    assert.deepEqual(store.load(), ['console:admob']);
    storage.data.set('k', JSON.stringify(['web:z']));
    assert.deepEqual(store.load(), ['web:z']);
    storage.data.set('k', '{not json');
    assert.deepEqual(store.load(), ['web:a']);

    const broken: KeyValueStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('quota');
      },
      removeItem() {
        throw new Error('blocked');
      },
    };
    const fallback = createLauncherPreferenceStore({
      defaults: ['web:a'],
      storage: broken,
    });
    fallback.save(['web:q']);
    assert.deepEqual(fallback.load(), ['web:q']);
  });
});

suite('mnw-product-launcher', () => {
  const mount = async (storage = memoryStorage()) => {
    const store = createLauncherPreferenceStore({
      defaults: catalog.defaultFavorites,
      storage,
    });
    const el = await fixture<MaterialNextProductLauncher>(html`
      <mnw-product-launcher
        current-product="notes"
        .catalog=${catalog}
        .store=${store}
      ></mnw-product-launcher>
    `);
    return {el, storage};
  };
  const tiles = (
    el: MaterialNextProductLauncher,
    selector = '.grid--favorites .tile'
  ) => [...el.shadowRoot!.querySelectorAll<HTMLElement>(selector)];
  const titles = (el: MaterialNextProductLauncher) =>
    tiles(el).map((t) => t.querySelector('.title')!.textContent!.trim());

  test('Google colors are the default and following the host palette is opt-in', async () => {
    const {el} = await mount();
    el.style.colorScheme = 'light';
    el.style.setProperty('--md-sys-color-surface-container', '#123456');
    el.style.setProperty('--md-sys-color-surface-container-lowest', '#abcdef');
    el.show();
    await el.updateComplete;
    const panel = el.shadowRoot!.querySelector('.panel')!;
    const card = el.shadowRoot!.querySelector('.card')!;
    assert.isFalse(el.followColorPalette);
    assert.equal(getComputedStyle(panel).backgroundColor, 'rgb(233, 238, 246)');
    assert.equal(getComputedStyle(card).backgroundColor, 'rgb(248, 250, 253)');
    el.followColorPalette = true;
    await el.updateComplete;
    assert.isTrue(el.hasAttribute('follow-color-palette'));
    assert.equal(getComputedStyle(panel).backgroundColor, 'rgb(18, 52, 86)');
    assert.equal(getComputedStyle(card).backgroundColor, 'rgb(171, 205, 239)');
    el.close();
    await el.updateComplete;
  });

  test('opens, shows visible favorites and redirects, and closes on Escape', async () => {
    const {el} = await mount();
    const toggled = oneEvent(el, 'launcher-toggle');
    el.shadowRoot!.querySelector<HTMLElement>('.trigger')!.click();
    assert.isTrue((await toggled).detail.open);
    await el.updateComplete;
    assert.deepEqual(titles(el), ['Profile', 'Repo']);
    assert.notExists(el.shadowRoot!.querySelector('.summary'));
    assert.isNull(
      el.shadowRoot!.querySelector('.panel')!.getAttribute('aria-describedby')
    );
    const link = tiles(el)[0] as HTMLAnchorElement;
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
    el.shadowRoot!.querySelector('.panel')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      })
    );
    await el.updateComplete;
    assert.isFalse(el.open);
  });

  test('edits are a draft until Done, keeping hidden favorites and emitting once', async () => {
    const {el, storage} = await mount();
    const changes: LauncherItemId[][] = [];
    el.addEventListener('launcher-change', (e) =>
      changes.push(e.detail.favoriteIds)
    );
    el.show();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
    await el.updateComplete;
    tiles(el)[0].click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.tile--add')!.click();
    await el.updateComplete;
    assert.deepEqual(titles(el), ['Repo', 'Play']);
    tiles(el)[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        altKey: true,
        bubbles: true,
      })
    );
    await el.updateComplete;
    assert.deepEqual(titles(el), ['Play', 'Repo']);
    assert.deepEqual(el.favoriteIds, [
      'android-app:notes',
      'console:play',
      'web:repo',
    ]);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
    assert.deepEqual(changes, []);
    el.shadowRoot!.querySelector<HTMLElement>('.done')!.click();
    await el.updateComplete;
    assert.deepEqual(changes, [
      ['android-app:notes', 'console:play', 'web:repo'],
    ]);
    assert.deepEqual(
      JSON.parse(storage.data.get('mnw-launcher:favorites')!).favoriteIds,
      changes[0]
    );
    assert.notExists(el.shadowRoot!.querySelector('.done'));
    await new Promise(requestAnimationFrame);
    assert.equal(el.shadowRoot!.activeElement?.className, 'edit');
    el.reset();
    await el.updateComplete;
    assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
  });

  test('Cancel and closing discard drafts, including a draft reset', async () => {
    const {el, storage} = await mount();
    const changes: LauncherItemId[][] = [];
    el.addEventListener('launcher-change', (e) =>
      changes.push(e.detail.favoriteIds)
    );
    el.show();
    await el.updateComplete;
    for (const action of ['cancel', 'escape', 'close']) {
      el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
      await el.updateComplete;
      tiles(el)[0].dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Delete', bubbles: true})
      );
      await el.updateComplete;
      assert.deepEqual(titles(el), ['Repo']);
      if (action === 'cancel')
        el.shadowRoot!.querySelector<HTMLElement>('.cancel')!.click();
      else if (action === 'close') el.close();
      else
        el.dispatchEvent(
          new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
        );
      await el.updateComplete;
      assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
      el.show();
      await el.updateComplete;
    }
    assert.deepEqual(changes, []);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
    // A saved custom list is not forgotten by resetting the draft then canceling.
    storage.data.set(
      'mnw-launcher:favorites',
      JSON.stringify({version: 1, favoriteIds: ['web:repo']})
    );
    el.close();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.reset')!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.cancel')!.click();
    await el.updateComplete;
    assert.deepEqual(el.favoriteIds, ['web:repo']);
    assert.deepEqual(
      JSON.parse(storage.data.get('mnw-launcher:favorites')!).favoriteIds,
      ['web:repo']
    );
  });

  test('pointer drops move apps between lists without saving, and pointer cancellation restores order', async () => {
    const {el, storage} = await mount();
    el.show();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
    await el.updateComplete;
    const pointer = (type: string, target: EventTarget, x: number, y: number) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 42,
          button: 0,
          clientX: x,
          clientY: y,
          bubbles: true,
        })
      );
    const center = (selector: string) => {
      const box = el
        .shadowRoot!.querySelector(selector)!
        .getBoundingClientRect();
      return [box.left + box.width / 2, box.top + box.height / 2] as const;
    };
    const add = el.shadowRoot!.querySelector<HTMLElement>('.tile--add')!;
    pointer('pointerdown', add, ...center('.tile--add'));
    pointer('pointermove', window, ...center('.card'));
    pointer('pointerup', window, ...center('.card'));
    await el.updateComplete;
    assert.include(el.favoriteIds, 'console:play');
    const favorites = tiles(el);
    const favorite = favorites[favorites.length - 1];
    pointer(
      'pointerdown',
      favorite,
      ...center('.grid--favorites .cell:last-child')
    );
    pointer('pointermove', window, ...center('.available'));
    pointer('pointerup', window, ...center('.available'));
    await el.updateComplete;
    assert.notInclude(el.favoriteIds, 'console:play');
    const before = [...el.favoriteIds];
    pointer(
      'pointerdown',
      tiles(el)[1],
      ...center('.grid--favorites .cell:last-child')
    );
    pointer(
      'pointermove',
      window,
      ...center('.grid--favorites .cell:first-child')
    );
    await el.updateComplete;
    assert.notDeepEqual(el.favoriteIds, before);
    pointer('pointercancel', window, 0, 0);
    await el.updateComplete;
    assert.deepEqual(el.favoriteIds, before);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
  });

  test('Google dark surfaces follow the host color scheme without adopting its palette', async () => {
    const {el} = await mount();
    el.style.colorScheme = 'dark';
    el.show();
    await el.updateComplete;
    assert.equal(
      getComputedStyle(el.shadowRoot!.querySelector('.panel')!).backgroundColor,
      'rgb(45, 46, 48)'
    );
    assert.equal(
      getComputedStyle(el.shadowRoot!.querySelector('.card')!).backgroundColor,
      'rgb(27, 27, 27)'
    );
  });

  test('a lifted tile follows the pointer while grid cells reorder, and closing cancels motion', async () => {
    const {el, storage} = await mount();
    el.show();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
    await el.updateComplete;
    const root = el.shadowRoot!;
    const source = tiles(el)[1];
    const cell = source.parentElement!;
    const box = cell.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const pointer = (
      type: string,
      target: EventTarget,
      clientX: number,
      clientY: number
    ) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 9,
          button: 0,
          clientX,
          clientY,
          bubbles: true,
        })
      );
    pointer('pointerdown', source, x, y);
    pointer('pointermove', window, x + 12, y + 12);
    await el.updateComplete;
    const ghost = root.querySelector<HTMLElement>('.drag-preview')!;
    assert.exists(ghost);
    assert.isTrue(ghost.inert);
    const before = ghost.getBoundingClientRect();
    pointer('pointermove', window, x + 22, y + 27);
    const after = ghost.getBoundingClientRect();
    assert.closeTo(after.left - before.left, 10, 0.5);
    assert.closeTo(after.top - before.top, 15, 0.5);
    const first = root
      .querySelector('.grid--favorites > .cell')!
      .getBoundingClientRect();
    pointer(
      'pointermove',
      window,
      first.left + first.width / 2,
      first.top + first.height / 2
    );
    await el.updateComplete;
    assert.equal(titles(el)[0], 'Repo');
    // A second reorder interrupts the first instead of stacking transforms.
    pointer('pointermove', window, x, y);
    await el.updateComplete;
    for (const tile of tiles(el))
      assert.isAtMost(tile.getAnimations().length, 1);
    window.dispatchEvent(new Event('resize'));
    await el.updateComplete;
    assert.notExists(root.querySelector('.drag-preview'));
    assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
    el.close();
    await el.updateComplete;
    assert.notExists(root.querySelector('.drag-preview'));
    assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
  });

  test('Edit and Cancel animate the mode change and closing clears pending animations', async () => {
    const {el} = await mount();
    el.show();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLElement>('.edit')!.click();
    await el.updateComplete;
    const panel = el.shadowRoot!.querySelector<HTMLElement>('.panel')!;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      assert.isAbove(panel.getAnimations().length, 0);
    }
    el.shadowRoot!.querySelector<HTMLElement>('.cancel')!.click();
    await el.updateComplete;
    assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
    el.close();
    await el.updateComplete;
    assert.isAtMost(
      panel.getAnimations().length,
      1,
      'only the CSS opening animation may remain'
    );
    el.show();
    await el.updateComplete;
    assert.exists(el.shadowRoot!.querySelector('.edit'));
  });

  test('a live color-scheme switch updates view and edit controls without a rerender', async () => {
    const {el} = await mount();
    el.style.colorScheme = 'light';
    el.show();
    await el.updateComplete;
    const panel = el.shadowRoot!.querySelector('.panel')!;
    const edit = el.shadowRoot!.querySelector<HTMLElement>('.edit')!;
    el.style.colorScheme = 'dark';
    assert.equal(getComputedStyle(panel).backgroundColor, 'rgb(45, 46, 48)');
    assert.equal(
      getComputedStyle(edit.shadowRoot!.querySelector('button')!).color,
      'rgb(227, 227, 227)'
    );
    edit.click();
    await el.updateComplete;
    const done = el.shadowRoot!.querySelector('.done')!;
    assert.equal(getComputedStyle(done).color, 'rgb(227, 227, 227)');
    el.style.colorScheme = 'light';
    assert.equal(getComputedStyle(panel).backgroundColor, 'rgb(233, 238, 246)');
    assert.equal(getComputedStyle(done).color, 'rgb(31, 31, 31)');
  });

  test('old stored favorites show the renamed admin and never retired products', async () => {
    const storage = memoryStorage();
    storage.data.set(
      'legacy-projects',
      JSON.stringify({
        version: 1,
        favoriteIds: [
          'tutorials-admin',
          'android-app:android-insider',
          'shortcut:google-play',
          'shortcut:codex',
          'android-app:smart-cleaner',
          'shortcut:github',
        ],
      })
    );
    const store = createLauncherPreferenceStore({
      defaults: [],
      storage,
      key: 'legacy-projects',
      migrate: migrateLegacyLauncherId,
    });
    const el = await fixture<MaterialNextProductLauncher>(
      html`<mnw-product-launcher open .store=${store}></mnw-product-launcher>`
    );
    assert.deepEqual(titles(el), [
      'Android Insider Admin Console',
      'Google Play',
      'GitHub profile',
    ]);
    assert.notExists(el.shadowRoot!.querySelector('.summary'));
    const edit = el.shadowRoot!.querySelector<
      HTMLElement & {selected: boolean}
    >('.edit')!;
    edit.click();
    await el.updateComplete;
    const content = el.shadowRoot!.textContent!;
    assert.notInclude(content, 'Codex');
    assert.notInclude(content, 'Smart Cleaner');
  });

  test('a launcher moved in the DOM keeps its store', async () => {
    const storage = memoryStorage();
    storage.data.set(
      'mnw-launcher:favorites',
      JSON.stringify({version: 1, favoriteIds: ['web:repo']})
    );
    const {el} = await mount(storage);
    assert.deepEqual(el.favoriteIds, ['web:repo']);
    // An app re-rendering its top bar detaches and reattaches the element.
    const parent = el.parentElement!;
    el.remove();
    parent.append(el);
    // Straight after the move, before any update: reset must forget the
    // stored list, and the update it causes must not reload it.
    el.reset();
    await el.updateComplete;
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
    assert.deepEqual(el.favoriteIds, [...catalog.defaultFavorites]);
  });

  test('a broken image falls back to the icon', async () => {
    const broken = createLauncherCatalog({
      items: [
        {
          kind: 'web',
          key: 'x',
          title: 'X',
          href: 'https://x.example/',
          image: 'asset:launcher/missing.svg',
          icon: 'star',
        },
      ],
      defaultFavorites: ['web:x'],
    });
    const el = await fixture<MaterialNextProductLauncher>(html`
      <mnw-product-launcher
        open
        .catalog=${broken}
        .store=${createLauncherPreferenceStore({defaults: ['web:x'], storage: memoryStorage()})}
      ></mnw-product-launcher>
    `);
    const img = el.shadowRoot!.querySelector('img')!;
    assert.equal(
      img.getAttribute('src'),
      '/assets/marketing/launcher/missing.svg'
    );
    img.dispatchEvent(new Event('error'));
    await el.updateComplete;
    assert.equal(
      el.shadowRoot!.querySelector('.icon md-icon')!.textContent,
      'star'
    );
  });
});
