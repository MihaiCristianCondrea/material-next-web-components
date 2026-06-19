import 'remixicon/fonts/remixicon.css';
import './components/button/ws-button.js';
import './components/app-bar/ws-app-bar.js';
import './components/drawer/ws-drawer.js';
import './components/drawer/ws-drawer-item.js';
import './components/brand/ws-brand-mark.js';
import './components/tabs/ws-tabs.js';
import './components/tabs/ws-tab.js';
import './components/breadcrumbs/ws-breadcrumbs.js';
import './components/code-block/ws-code-block.js';
import './components/switch/ws-switch.js';
import './components/card/ws-card.js';
import './components/page/ws-page.js';
import './components/docs-shell/ws-docs-shell.js';
import './components/docs-shell/ws-hero.js';
import './components/docs-shell/ws-footer.js';

const docsTabSelectors =
  'ws-tabs.site-tabs ws-tab, ws-tabs.collection-tabs ws-tab';
const docsLinkSelector =
  'a[href]:not([target]):not([download]), ws-tab[href], [data-site-logo]';
const siteLogoSelector = '[data-site-logo]';
const contentSelector = '.docs-content';

let activeTocObserver: IntersectionObserver | null = null;
let activeController: AbortController | null = null;
let currentPageUrl = new URL(window.location.href);

const toMilliseconds = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 240;
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000;
  return Number.parseFloat(trimmed) || 240;
};

const getTabsMotionDuration = (tabs: Element) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;

  return toMilliseconds(
    getComputedStyle(tabs).getPropertyValue('--ws-motion-duration-slow')
  );
};

const getElementUrl = (element: Element) => {
  const href = element.getAttribute('href');
  return href ? new URL(href, window.location.href) : null;
};

const findNavigableElement = (event: Event) =>
  event
    .composedPath()
    .find(
      (target): target is Element =>
        target instanceof Element && target.matches(docsLinkSelector)
    );

const sameDocument = (url: URL, base = currentPageUrl) =>
  url.origin === base.origin &&
  url.pathname === base.pathname &&
  url.search === base.search;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const target = getHashTarget(hash);
  target?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
};

const isDocsPageUrl = (url: URL) =>
  url.origin === window.location.origin &&
  url.protocol.startsWith('http') &&
  !url.pathname.match(/\.[a-z0-9]+$/i);

const restartBrandAnimation = (logo: Element) => {
  const brandMark = logo.querySelector('ws-brand-mark') as {
    restartAnimation?: () => void;
  } | null;
  brandMark?.restartAnimation?.();
};

const handleSiteLogoClick = async (element: Element, url: URL) => {
  restartBrandAnimation(element);

  if (sameDocument(url) && !url.hash) return;

  const handled = await navigateTo(url);
  if (!handled) window.location.href = url.href;
};

const updateSiteTabs = (url: URL) => {
  for (const tab of document.querySelectorAll('ws-tabs.site-tabs ws-tab')) {
    const tabUrl = getElementUrl(tab);
    const isHomeTab = tab.textContent?.trim() === 'Home';
    const selected = Boolean(
      tabUrl &&
        (isHomeTab
          ? sameDocument(tabUrl, url)
          : tabUrl.pathname === url.pathname ||
            url.pathname.startsWith(tabUrl.pathname))
    );

    tab.toggleAttribute('selected', selected);
    if (selected) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  }
};

const focusContentHeading = () => {
  const content = document.querySelector<HTMLElement>(contentSelector);
  const heading = content?.querySelector<HTMLElement>('h1, h2');
  if (!heading) return;

  heading.tabIndex = -1;
  heading.focus({preventScroll: true});
  heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), {
    once: true,
  });
};

const setCurrentTocLink = (id?: string) => {
  const tocLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.example-toc a')
  );
  if (!tocLinks.length || !id) return;

  tocLinks.forEach((link) => link.removeAttribute('aria-current'));
  tocLinks
    .find((link) => decodeURIComponent(link.hash.slice(1)) === id)
    ?.setAttribute('aria-current', 'true');
};

const enhanceExampleToc = () => {
  activeTocObserver?.disconnect();
  activeTocObserver = null;

  const tocLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.example-toc a')
  );
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.example-content h2[id], .example-content h3[id]'
    )
  );

  if (!tocLinks.length || !headings.length) return;

  tocLinks.forEach((link) => {
    link.addEventListener('click', () =>
      setCurrentTocLink(decodeURIComponent(link.hash.slice(1)))
    );
  });

  if (!('IntersectionObserver' in window)) {
    setCurrentTocLink(headings[0]?.id);
    return;
  }

  activeTocObserver = new IntersectionObserver(
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

  headings.forEach((heading) => activeTocObserver?.observe(heading));
  setCurrentTocLink(headings[0]?.id);
};

const runContentScripts = (root: Element) => {
  for (const script of Array.from(root.querySelectorAll('script'))) {
    const executableScript = document.createElement('script');

    for (const {name, value} of Array.from(script.attributes)) {
      executableScript.setAttribute(name, value);
    }

    executableScript.textContent = script.textContent;
    script.replaceWith(executableScript);
  }
};

const replacePageContent = (html: string, url: URL) => {
  const nextDocument = new DOMParser().parseFromString(html, 'text/html');
  const currentContent = document.querySelector(contentSelector);
  const nextContent = nextDocument.querySelector(contentSelector);

  if (!currentContent || !nextContent) return false;

  const importedContent = document.importNode(nextContent, true);

  document.title = nextDocument.title;
  currentPageUrl = new URL(url.href);
  currentContent.replaceWith(importedContent);
  runContentScripts(importedContent);
  updateSiteTabs(url);
  enhanceExampleToc();
  return true;
};

const navigateTo = async (url: URL, options: {replace?: boolean} = {}) => {
  if (!isDocsPageUrl(url)) return false;

  if (sameDocument(url)) {
    if (url.hash) {
      if (window.location.href !== url.href) {
        window.history[options.replace ? 'replaceState' : 'pushState'](
          null,
          '',
          url.href
        );
      }
      scrollToHash(url.hash);
      setCurrentTocLink(decodeURIComponent(url.hash.slice(1)));
    }
    return true;
  }

  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  document.documentElement.setAttribute('data-ws-navigating', '');

  try {
    const response = await fetch(url.href, {
      headers: {'X-Requested-With': 'fetch'},
      signal: controller.signal,
    });

    if (!response.ok) return false;
    const html = await response.text();
    if (!replacePageContent(html, url)) return false;

    if (options.replace) {
      window.history.replaceState(null, '', url.href);
    } else {
      window.history.pushState(null, '', url.href);
    }

    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    if (url.hash) {
      scrollToHash(url.hash);
      setCurrentTocLink(decodeURIComponent(url.hash.slice(1)));
    }
    focusContentHeading();
    return true;
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError') {
      console.error('Unable to load documentation page.', error);
    }
    return (error as DOMException).name === 'AbortError';
  } finally {
    if (activeController === controller) activeController = null;
    document.documentElement.removeAttribute('data-ws-navigating');
  }
};

const enhanceDocsNavigation = () => {
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

    const element = findNavigableElement(event);
    if (!element) return;

    const url = getElementUrl(element);
    if (!url || !isDocsPageUrl(url)) return;

    if (element.matches(siteLogoSelector)) {
      event.preventDefault();
      void handleSiteLogoClick(element, url);
      return;
    }

    if (sameDocument(url) && !url.hash) return;

    event.preventDefault();

    const tabs = element.closest('ws-tabs');
    const delay = tabs ? getTabsMotionDuration(tabs) : 0;
    window.setTimeout(async () => {
      const handled = await navigateTo(url);
      if (!handled) window.location.href = url.href;
    }, delay);
  });

  window.addEventListener('popstate', async () => {
    const handled = await navigateTo(new URL(window.location.href), {
      replace: true,
    });
    if (!handled) window.location.reload();
  });
};

const prefetchDocsTabs = () => {
  const connection = (
    navigator as Navigator & {connection?: {saveData?: boolean}}
  ).connection;
  if (connection?.saveData) return;

  const prefetched = new Set<string>();
  for (const tab of document.querySelectorAll(docsTabSelectors)) {
    const url = getElementUrl(tab);
    if (!url || !isDocsPageUrl(url) || sameDocument(url)) continue;
    if (prefetched.has(url.href)) continue;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    link.as = 'document';
    document.head.append(link);
    prefetched.add(url.href);
  }
};

const scheduleDocsTabPrefetch = () => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetchDocsTabs);
    return;
  }

  globalThis.setTimeout(prefetchDocsTabs, 250);
};

enhanceDocsNavigation();
enhanceExampleToc();
scheduleDocsTabPrefetch();
