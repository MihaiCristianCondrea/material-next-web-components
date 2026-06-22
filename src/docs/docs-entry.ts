/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/tabs.js';
import '../app-showcase.js';
import '../code-block.js';
import '../docs-page.js';
import '../docs-shell.js';
import '../docs-table-of-contents.js';
import '../docs-top-app-bar.js';
import '../docs-vertical-tabs.js';
import '../expressive-tab-bar.js';
import '../material-next-home.js';

const linkSelector =
  'a[href]:not([target]):not([download]), md-primary-tab a[href], mnw-docs-vertical-tabs, mnw-docs-table-of-contents';
const contentSelector = '.docs-route-content';
let currentPageUrl = new URL(window.location.href);
let activeController: AbortController | undefined;
let tocObserver: IntersectionObserver | undefined;

const isDocsPageUrl = (url: URL) =>
  url.origin === window.location.origin &&
  url.protocol.startsWith('http') &&
  !url.pathname.match(/\.[a-z0-9]+$/i);

const sameDocument = (url: URL, base = currentPageUrl) =>
  url.origin === base.origin &&
  url.pathname === base.pathname &&
  url.search === base.search;

const setNavigating = (navigating: boolean) => {
  document.documentElement.toggleAttribute('data-docs-navigating', navigating);
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getUrl = (element: Element) => {
  const href = element.getAttribute('href');
  return href ? new URL(href, window.location.href) : null;
};

const findLink = (event: Event) =>
  event
    .composedPath()
    .find(
      (target): target is Element =>
        target instanceof Element && target.matches(linkSelector)
    );

const getHashTarget = (hash: string) => {
  if (!hash) return null;
  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  if (target) return target;
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
};

const scrollToHash = (hash: string) => {
  getHashTarget(hash)?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
};

const updateSiteTabs = (url: URL) => {
  const tabs = Array.from(document.querySelectorAll('md-tabs.site-tabs'));
  for (const tabsElement of tabs) {
    const tabLinks = Array.from(
      tabsElement.querySelectorAll<HTMLAnchorElement>('md-primary-tab a[href]')
    );
    let activeIndex = 0;
    tabLinks.forEach((link, index) => {
      const routePrefix = link.dataset.routePrefix;
      const tabUrl = new URL(routePrefix ?? link.href, window.location.href);
      const selected =
        routePrefix === '/'
          ? url.pathname === tabUrl.pathname
          : url.pathname === tabUrl.pathname ||
            url.pathname.startsWith(tabUrl.pathname);
      link.toggleAttribute('aria-current', selected);
      link.closest('md-primary-tab')?.toggleAttribute('active', selected);
      if (selected) activeIndex = index;
    });
    (tabsElement as HTMLElement & {activeTabIndex?: number}).activeTabIndex =
      activeIndex;
    tabsElement.setAttribute('active-tab-index', String(activeIndex));
  }
};

const setCurrentTocLink = (id?: string) => {
  if (!id) return;
  document
    .querySelectorAll('.examples-toc a, mnw-docs-table-of-contents')
    .forEach((element) => {
      if (element instanceof HTMLAnchorElement) {
        element.toggleAttribute(
          'aria-current',
          decodeURIComponent(element.hash.slice(1)) === id
        );
        return;
      }

      const toc = element as HTMLElement & {
        activeIndex?: number;
        items?: Array<{href?: string}>;
      };
      const index =
        toc.items?.findIndex((item) => {
          if (!item.href?.startsWith('#')) return false;
          return decodeURIComponent(item.href.slice(1)) === id;
        }) ?? -1;
      if (index >= 0) {
        toc.activeIndex = index;
      }
    });
};

const enhanceExampleToc = () => {
  tocObserver?.disconnect();
  tocObserver = undefined;
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.example-content h2[id], .example-content h3[id], .examples-content h2[id], .examples-content h3[id]'
    )
  );
  if (!headings.length || !('IntersectionObserver' in window)) return;
  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible?.target instanceof HTMLElement) {
        setCurrentTocLink(visible.target.id);
      }
    },
    {rootMargin: '0px 0px -70% 0px', threshold: 0.1}
  );
  headings.forEach((heading) => tocObserver?.observe(heading));
  setCurrentTocLink(headings[0]?.id);
};

const replaceContent = (html: string, url: URL) => {
  const nextDocument = new DOMParser().parseFromString(html, 'text/html');
  const currentContent = document.querySelector(contentSelector);
  const nextContent = nextDocument.querySelector(contentSelector);
  if (!currentContent || !nextContent) return false;
  const imported = document.importNode(nextContent, true);
  document.title = nextDocument.title;
  currentPageUrl = new URL(url.href);
  currentContent.replaceWith(imported);
  updateSiteTabs(url);
  enhanceExampleToc();
  const focusTarget =
    document.querySelector<HTMLElement>('.docs-route-content h1') ??
    document.querySelector<HTMLElement>('.docs-route-content');
  focusTarget?.setAttribute('tabindex', '-1');
  focusTarget?.focus({preventScroll: true});
  return true;
};

const navigateTo = async (url: URL, options: {replace?: boolean} = {}) => {
  if (!isDocsPageUrl(url)) return false;
  if (sameDocument(url)) {
    if (url.hash) {
      window.history[options.replace ? 'replaceState' : 'pushState'](
        null,
        '',
        url.href
      );
      scrollToHash(url.hash);
      setCurrentTocLink(decodeURIComponent(url.hash.slice(1)));
    }
    return true;
  }
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  setNavigating(true);
  try {
    const response = await fetch(url.href, {
      headers: {'X-Requested-With': 'fetch'},
      signal: controller.signal,
    });
    if (!response.ok) return false;
    if (!replaceContent(await response.text(), url)) return false;
    window.history[options.replace ? 'replaceState' : 'pushState'](
      null,
      '',
      url.href
    );
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    if (url.hash) scrollToHash(url.hash);
    return true;
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError') {
      console.error('Unable to load documentation page.', error);
      document.dispatchEvent(
        new CustomEvent('docs-navigation-error', {
          detail: {url: url.href, error},
        })
      );
    }
    return (error as DOMException).name === 'AbortError';
  } finally {
    if (activeController === controller) activeController = undefined;
    setNavigating(false);
  }
};

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
  const element = findLink(event);
  if (!element || !('getAttribute' in element)) return;
  const url = getUrl(element);
  if (!url || !isDocsPageUrl(url)) return;
  if (sameDocument(url) && !url.hash) return;
  event.preventDefault();
  void navigateTo(url).then((handled) => {
    if (!handled) window.location.href = url.href;
  });
});

window.addEventListener('popstate', () => {
  void navigateTo(new URL(window.location.href), {replace: true}).then(
    (handled) => {
      if (!handled) window.location.reload();
    }
  );
});

updateSiteTabs(currentPageUrl);
enhanceExampleToc();
