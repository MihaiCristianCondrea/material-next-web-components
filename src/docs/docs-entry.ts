/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// The documentation site's script: registers every public element, wires the
// live demos and enhances plain links with client-side navigation. Pages work
// without it; links are ordinary links.
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '../app-showcase.js';
import '../code-block.js';
import '../docs-page.js';
import '../docs-shell.js';
import '../docs-table-of-contents.js';
import '../docs-top-app-bar.js';
import '../docs-vertical-tabs.js';
import '../expressive-tab-bar.js';
import '../material-next-home.js';
import '../marketing/index.js';
import '../launcher/index.js';
import '../theme/index.js';
import {configureMarketingAssets} from '../marketing/index.js';
import {runDemos} from './demos/index.js';

// The site root is where this bundle is served, which keeps every URL working
// under the GitHub Pages repository subpath.
const siteRoot = new URL('./', import.meta.url);
configureMarketingAssets({base: new URL('material-next/', siteRoot).href});

const contentSelector = '.docs-route-content';
let currentPageUrl = new URL(window.location.href);
let activeController: AbortController | undefined;
let tocObserver: IntersectionObserver | undefined;
let disposeDemos: () => void = () => {};

const isDocsPageUrl = (url: URL) =>
  url.origin === window.location.origin &&
  url.pathname.startsWith(siteRoot.pathname) &&
  !/\.[a-z0-9]+$/i.test(url.pathname);

const sameDocument = (url: URL, base = currentPageUrl) =>
  url.origin === base.origin &&
  url.pathname === base.pathname &&
  url.search === base.search;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The top app bar, footer and <head> stay in place across navigations, but
 * their URLs are relative to the first page. Making them absolute once keeps
 * them right on every later page.
 */
const absolutizePersistentUrls = () => {
  const content = document.querySelector(contentSelector);
  for (const el of document.querySelectorAll<HTMLElement>('[href], [src]')) {
    if (content?.contains(el)) continue;
    for (const attr of ['href', 'src']) {
      const value = el.getAttribute(attr);
      if (value && !/^(#|[a-z]+:)/i.test(value)) {
        el.setAttribute(attr, new URL(value, currentPageUrl).href);
      }
    }
  }
};

const updateSiteNav = (url: URL) => {
  const path = url.pathname.slice(siteRoot.pathname.length - 1);
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>('.site-tab-link'),
  ];
  let matched = false;
  for (const link of links) {
    const prefix = link.dataset.routePrefix ?? '/';
    const selected =
      !matched && (prefix === '/' ? path === '/' : path.startsWith(prefix));
    if (selected) matched = true;
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  positionSiteIndicator();
  revealActiveTab();
};

/** The docs chrome survives route changes, so one pill can move between links. */
let indicatorAnimation: Animation | undefined;
const positionSiteIndicator = (animate = true) => {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  const selected = nav?.querySelector<HTMLElement>('[aria-current="page"]');
  const indicator = nav?.querySelector<HTMLElement>('.site-tab-indicator');
  if (!nav || !selected || !indicator) return;
  const before = indicator.getBoundingClientRect();
  const box = nav.getBoundingClientRect();
  const target = selected.getBoundingClientRect();
  const initialized = nav.hasAttribute('data-indicator');
  indicatorAnimation?.cancel();
  indicator.style.left = `${target.left - box.left}px`;
  indicator.style.width = `${target.width}px`;
  nav.setAttribute('data-indicator', '');
  if (!animate || !initialized || prefersReducedMotion()) return;
  indicatorAnimation = indicator.animate(
    [
      {
        left: `${before.left - box.left}px`,
        width: `${before.width}px`,
      },
      {left: `${target.left - box.left}px`, width: `${target.width}px`},
    ],
    {duration: 350, easing: 'cubic-bezier(0.2, 0, 0, 1)'}
  );
};

/** Keeps the current section's link in view in the app bar's scrolling nav row. */
const revealActiveTab = () => {
  const link = document.querySelector<HTMLElement>(
    '.site-tab-link[aria-current="page"]'
  );
  const row = link?.closest('.site-nav')?.assignedSlot?.parentElement;
  if (!link || !row || row.scrollWidth <= row.clientWidth) return;
  const box = row.getBoundingClientRect();
  const tab = link.getBoundingClientRect();
  row.scrollLeft += tab.left - box.left - (box.width - tab.width) / 2;
};

/** Opens the side navigation on wide windows, folds it on narrow ones. */
const syncSideNav = () => {
  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    'details[data-collapse-below]'
  )) {
    const below = Number(details.dataset.collapseBelow);
    details.open = window.innerWidth > below;
  }
};

let lastWide = window.innerWidth > 1100;
window.addEventListener('resize', () => {
  const wide = window.innerWidth > 1100;
  if (wide !== lastWide) {
    lastWide = wide;
    syncSideNav();
  }
});

const getHashTarget = (hash: string) =>
  hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;

const scrollToHash = (hash: string, {focus = false} = {}) => {
  const target = getHashTarget(hash);
  if (!target) return;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
  // As a native jump to an anchor does, move keyboard focus there (skip link,
  // table of contents), so the next Tab continues from the target.
  if (focus) {
    if (
      !target.matches('a[href], button, input, select, textarea, [tabindex]')
    ) {
      target.tabIndex = -1;
    }
    target.focus({preventScroll: true});
  }
};

type Toc = HTMLElement & {activeIndex: number; items: Array<{href: string}>};

const setCurrentTocLink = (id: string) => {
  for (const toc of document.querySelectorAll<Toc>(
    'mnw-docs-table-of-contents'
  )) {
    const index = toc.items.findIndex(
      (item) => decodeURIComponent(item.href.slice(1)) === id
    );
    if (index >= 0) toc.activeIndex = index;
  }
};

const trackToc = () => {
  tocObserver?.disconnect();
  const headings = [
    ...document.querySelectorAll<HTMLElement>(
      `${contentSelector} .prose > h2[id]`
    ),
  ];
  if (!headings.length || !('IntersectionObserver' in window)) return;
  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setCurrentTocLink(visible.target.id);
    },
    {rootMargin: '0px 0px -70% 0px'}
  );
  headings.forEach((h) => tocObserver!.observe(h));
};

/** Everything a freshly shown page needs: demos, the TOC tracker, the side nav. */
const enhancePage = () => {
  disposeDemos();
  const content = document.querySelector<HTMLElement>(contentSelector);
  disposeDemos = content ? runDemos(content) : () => {};
  trackToc();
  syncSideNav();
};

const replaceContent = (html: string) => {
  const next = new DOMParser().parseFromString(html, 'text/html');
  const current = document.querySelector(contentSelector);
  const incoming = next.querySelector(contentSelector);
  if (!current || !incoming) return false;
  document.title = next.title;
  current.replaceWith(document.importNode(incoming, true));
  return true;
};

const navigateTo = async (url: URL, {push = true} = {}) => {
  if (!isDocsPageUrl(url)) return false;
  if (sameDocument(url)) {
    if (push) history.pushState(null, '', url.href);
    if (url.hash) {
      scrollToHash(url.hash, {focus: push});
      setCurrentTocLink(decodeURIComponent(url.hash.slice(1)));
    }
    return true;
  }
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  document.documentElement.toggleAttribute('data-docs-navigating', true);
  try {
    const response = await fetch(url.href, {signal: controller.signal});
    if (!response.ok) return false;
    const html = await response.text();
    if (controller.signal.aborted) return true;
    // The history entry first, so the new content's relative URLs resolve
    // against the page they were written for.
    if (push) history.pushState(null, '', url.href);
    currentPageUrl = new URL(url.href);
    if (!replaceContent(html)) return false;
    updateSiteNav(url);
    enhancePage();
    if (url.hash) scrollToHash(url.hash);
    else window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    const heading = document.querySelector<HTMLElement>(
      `${contentSelector} h1`
    );
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({preventScroll: true});
    }
    return true;
  } catch (error) {
    if ((error as DOMException).name === 'AbortError') return true;
    console.warn('Falling back to a full page load:', error);
    return false;
  } finally {
    if (activeController === controller) activeController = undefined;
    document.documentElement.toggleAttribute('data-docs-navigating', false);
  }
};

const linkFromEvent = (event: Event) =>
  event
    .composedPath()
    .find(
      (target): target is HTMLAnchorElement =>
        target instanceof HTMLAnchorElement &&
        target.hasAttribute('href') &&
        !target.hasAttribute('download') &&
        (!target.target || target.target === '_self')
    );

document.addEventListener('click', (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const link = linkFromEvent(event);
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  if (!isDocsPageUrl(url)) return;
  // Links inside live demos belong to the demo (an iframe, a component's own
  // routing), except ordinary page links.
  if (link.closest('[data-demo]') && !link.hasAttribute('data-docs-link'))
    return;
  event.preventDefault();
  void navigateTo(url).then((handled) => {
    if (!handled) window.location.assign(url.href);
  });
});

window.addEventListener('popstate', () => {
  const url = new URL(window.location.href);
  void navigateTo(url, {push: false}).then((handled) => {
    if (!handled) window.location.reload();
  });
});

const siteNav = document.querySelector<HTMLElement>('.site-nav');
if (siteNav) {
  const observer = new ResizeObserver(() => {
    positionSiteIndicator(false);
    revealActiveTab();
  });
  observer.observe(siteNav);
  siteNav
    .querySelectorAll('.site-tab-link')
    .forEach((link) => observer.observe(link));
}
void document.fonts.ready.then(() => positionSiteIndicator(false));
absolutizePersistentUrls();
updateSiteNav(currentPageUrl);
// The app bar renders its nav row after this script runs.
requestAnimationFrame(revealActiveTab);
enhancePage();
if (currentPageUrl.hash)
  requestAnimationFrame(() => scrollToHash(currentPageUrl.hash));
