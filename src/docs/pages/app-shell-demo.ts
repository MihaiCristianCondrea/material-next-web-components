/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// The app shell demo page (demos/app-shell/): a small admin console whose
// router is the app's own code. The shell lays out and reports; this file
// decides what each URL shows and when the URL changes.
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '../../app-shell/index.js';
import '../../launcher/index.js';
import {configureMarketingAssets} from '../../marketing/index.js';
import type {MaterialNextAppShell} from '../../app-shell/index.js';

// This bundle is served from the site root.
configureMarketingAssets({
  base: new URL('material-next/', new URL('./', import.meta.url)).href,
});

// The app applies and persists the footer's requested theme.
const themeFooter = document.querySelector('mnw-app-shell-footer')!;
const themeMedia = matchMedia('(prefers-color-scheme: dark)');
let theme: 'light' | 'dark' | 'system' = 'system';
try {
  const stored = localStorage.getItem('mnw-console-demo:theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system')
    theme = stored;
} catch {
  /* Storage is optional. */
}
const applyTheme = () => {
  themeFooter.theme = theme;
  document.documentElement.dataset.docsTheme =
    theme === 'system' ? (themeMedia.matches ? 'dark' : 'light') : theme;
};
themeFooter.addEventListener('theme-change', (event) => {
  theme = event.detail.theme;
  try {
    localStorage.setItem('mnw-console-demo:theme', theme);
  } catch {
    /* Storage is optional. */
  }
  applyTheme();
});
themeMedia.addEventListener('change', applyTheme);
applyTheme();

// example
interface Screen {
  heading: string;
  leading: 'menu' | 'back';
  render(): string;
}

const ARTICLES: Record<string, string> = {
  'android-16': 'Android 16 is out: what changes for your apps',
};

const screens: Array<[RegExp, (match: RegExpMatchArray) => Screen]> = [
  [
    /^(feed\/)?$/,
    () => ({
      heading: 'Feed',
      leading: 'menu',
      render: () => `<p>Published articles, newest first.</p>
        <ul class="console-list">${Object.entries(ARTICLES)
          .map(([id, title]) => `<li><a href="feed/${id}/">${title}</a></li>`)
          .join('')}</ul>`,
    }),
  ],
  [
    /^feed\/([a-z0-9-]+)\/$/,
    ([, id]) => ({
      heading: ARTICLES[id] ?? 'Article',
      leading: 'back',
      render: () =>
        '<p>An article opened from the Feed: the shell leads with Back, and Feed stays the current destination.</p>',
    }),
  ],
  [
    /^studio-bot\/$/,
    () => ({
      heading: 'Studio Bot',
      leading: 'menu',
      render: () => '<p>Conversations and prompts.</p>',
    }),
  ],
  [
    /^lessons\/$/,
    () => ({
      heading: 'Lessons',
      leading: 'menu',
      render:
        () => `<p>Type in the lesson, then pick another destination: the console asks first.</p>
        <label class="console-field">Lesson notes
          <textarea id="lesson" rows="5"></textarea></label>`,
    }),
  ],
  [
    /^settings\/$/,
    () => ({
      heading: 'Settings',
      leading: 'menu',
      render: () => '<p>Console preferences.</p>',
    }),
  ],
];

const shell = document.querySelector<MaterialNextAppShell>('mnw-app-shell')!;
const outlet = document.querySelector<HTMLElement>('#screen')!;
const dialog = document.querySelector<HTMLDialogElement>('#leave-dialog')!;
// <base href> is the app's root: every route is relative to it.
const appRoot = new URL(document.baseURI);
const fixedModal =
  new URL(location.href).searchParams.get('drawer') === 'modal';
let unsaved = false;
/** The URL of the screen on show. */
let shown = location.href;

const show = (url: URL) => {
  shown = url.href;
  const route = url.pathname.slice(appRoot.pathname.length);
  const entry = screens.find(([pattern]) => pattern.test(route));
  let screen: Screen = {
    heading: 'Not found',
    leading: 'back',
    render: () => '<p>No such page.</p>',
  };
  if (entry) {
    const [pattern, screenFor] = entry;
    screen = screenFor(route.match(pattern)!);
  }
  // The app tells the shell where it is; the shell never reads the router.
  shell.heading = screen.heading;
  shell.leading = screen.leading;
  shell.activePath = url.pathname;
  document.title = `${screen.heading} · Android Insider admin (demo)`;
  outlet.innerHTML = screen.render();
  unsaved = false;
};

/** Resolves true when the user may leave the screen on show. */
const mayLeave = () =>
  !unsaved
    ? Promise.resolve(true)
    : new Promise<boolean>((resolve) => {
        dialog.addEventListener(
          'close',
          () => resolve(dialog.returnValue === 'leave'),
          {once: true}
        );
        dialog.returnValue = '';
        dialog.showModal();
      });

const go = async (url: URL) => {
  if (url.href === shown || !(await mayLeave())) return;
  if (fixedModal) url.searchParams.set('drawer', 'modal');
  history.pushState(null, '', url);
  show(url);
};

// Material buttons do not submit a dialog form, so they close it themselves.
dialog.addEventListener('click', (event) => {
  const answer = (event.target as Element).closest<HTMLElement>('[data-answer]')
    ?.dataset.answer;
  if (answer) dialog.close(answer);
});

// A destination in the drawer: the router takes over from the link.
shell.addEventListener('navigation-request', (event) => {
  event.preventDefault();
  void go(new URL(event.detail.url));
});

// Up from an article: back to the Feed.
shell.addEventListener('back-request', () => {
  void go(new URL('feed/', appRoot));
});

// Links inside screens go through the same router.
outlet.addEventListener('click', (event) => {
  const link = (event.target as Element).closest('a');
  if (!link || link.target || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  void go(new URL(link.href));
});

outlet.addEventListener('input', () => {
  unsaved = true;
});

// Back and Forward: the browser has already moved; ask, and step back to
// the screen on show if the user stays.
window.addEventListener('popstate', async () => {
  if (await mayLeave()) show(new URL(location.href));
  else history.pushState(null, '', shown);
});

if (new URL(location.href).searchParams.get('drawer') === 'modal')
  shell.navigationMode = 'modal';
show(new URL(location.href));
// /example

// The docs page around this frame switches the drawer presentation. Only the
// shell's navigation-mode changes; the route and the screen stay.
window.addEventListener('message', (event) => {
  const data = event.data as {type?: string; mode?: string};
  if (event.origin !== location.origin) return;
  if (data?.type !== 'app-shell-presentation') return;
  if (data.mode === 'auto' || data.mode === 'modal') {
    shell.navigationMode = data.mode;
  }
});
