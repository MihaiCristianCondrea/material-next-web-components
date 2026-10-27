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
    assert.lengthOf(PROJECT_LAUNCHER_CATALOG.items, 10);
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
        'android-app:android-insider',
        'web:material-next',
      ]
    );
    for (const id of ['shortcut:codex', 'android-app:smart-cleaner']) {
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
    assert.deepEqual(store.load(), ['shortcut:codex', 'console:admob']);
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

  test('edits: remove, add, keyboard reorder and reset, keeping hidden favorites', async () => {
    const {el, storage} = await mount();
    el.show();
    await el.updateComplete;
    const edit = el.shadowRoot!.querySelector<
      HTMLElement & {selected: boolean}
    >('.edit')!;
    edit.selected = true;
    edit.dispatchEvent(new Event('change'));
    await el.updateComplete;

    let change = oneEvent(el, 'launcher-change');
    tiles(el)[0].querySelector<HTMLButtonElement>('.remove')!.click();
    assert.deepEqual((await change).detail.favoriteIds, [
      'android-app:notes',
      'web:repo',
    ]);
    await el.updateComplete;

    change = oneEvent(el, 'launcher-change');
    el.shadowRoot!.querySelector<HTMLButtonElement>('.tile--add')!.click();
    assert.deepEqual((await change).detail.favoriteIds, [
      'android-app:notes',
      'web:repo',
      'console:play',
    ]);
    await el.updateComplete;
    assert.deepEqual(titles(el), ['Repo', 'Play']);

    change = oneEvent(el, 'launcher-change');
    tiles(el)[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        altKey: true,
        bubbles: true,
      })
    );
    // The hidden Notes app keeps its first slot.
    assert.deepEqual((await change).detail.favoriteIds, [
      'android-app:notes',
      'console:play',
      'web:repo',
    ]);
    await el.updateComplete;
    assert.deepEqual(titles(el), ['Play', 'Repo']);
    assert.include(
      el.shadowRoot!.querySelector('[role="status"]')!.textContent!,
      'Play moved to position 1 of 2'
    );
    assert.deepEqual(
      JSON.parse(storage.data.get('mnw-launcher:favorites')!).favoriteIds,
      ['android-app:notes', 'console:play', 'web:repo']
    );
    assert.include(
      el.shadowRoot!.querySelector('#reorder-hint')!.textContent!,
      '1 favorite hidden on this page'
    );

    el.reset();
    await el.updateComplete;
    assert.deepEqual(el.favoriteIds, [
      'android-app:notes',
      'shortcut:profile',
      'web:repo',
    ]);
    assert.isFalse(storage.data.has('mnw-launcher:favorites'));
  });

  test('old stored favorites show the renamed admin and never retired products', async () => {
    const storage = memoryStorage();
    storage.data.set(
      'legacy-projects',
      JSON.stringify({
        version: 1,
        favoriteIds: [
          'tutorials-admin',
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
      'GitHub profile',
    ]);
    assert.notExists(el.shadowRoot!.querySelector('.summary'));
    const edit = el.shadowRoot!.querySelector<
      HTMLElement & {selected: boolean}
    >('.edit')!;
    edit.selected = true;
    edit.dispatchEvent(new Event('change'));
    await el.updateComplete;
    const content = el.shadowRoot!.textContent!;
    assert.notInclude(content, 'Codex');
    assert.notInclude(content, 'Smart Cleaner');
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
