/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  mountMarketingGallery,
  type GalleryHandle,
  type GalleryOptions,
} from './gallery.js';
import {
  mountScreenPrototype,
  type PrototypeHandle,
  type PrototypeOptions,
} from './prototype.js';

export interface MarketingHubOptions extends Omit<
  GalleryOptions,
  'prototypeUrl' | 'open'
> {
  /** Defaults for prototype parameters the URL leaves out. */
  prototypeDefaults?: PrototypeOptions['defaults'];
  /** Show the "Show ads" switch on the prototype. */
  adsToggle?: boolean;
  /** A frameless phone fills the prototype stage. Default `true`. */
  fillPhone?: boolean;
}

export interface MarketingHubHandle {
  /** `gallery`, or `prototype` while a screen is open. */
  page(): 'gallery' | 'prototype';
  /** Opens a hub URL: with `?id=` a screen, without it the gallery. */
  go(href: string): void;
  destroy(): void;
}

const isPrototype = (url: URL) => url.searchParams.has('id');

/**
 * The gallery and the prototype in one page. A card opens its screen without
 * a page load, and **All screens** (or Back) returns to the gallery where it
 * was scrolled. The URL keeps the prototype's parameters (`?id=…`), so every
 * screen still has its own address to share or capture; `screen.html` pages
 * made with `mountScreenPrototype()` keep working beside it.
 */
export const mountMarketingHub = ({
  prototypeDefaults,
  adsToggle,
  fillPhone,
  root = document.body,
  ...gallery
}: MarketingHubOptions): MarketingHubHandle => {
  let current: GalleryHandle | PrototypeHandle | undefined;
  let page: 'gallery' | 'prototype' = 'gallery';
  let galleryScroll = 0;
  const hubPath = () => location.pathname;
  const galleryTitle = document.title;
  // The hub puts the gallery back where it was itself.
  const restoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';

  const show = () => {
    const next = isPrototype(new URL(location.href)) ? 'prototype' : 'gallery';
    if (page === 'gallery' && current) galleryScroll = scrollY;
    current?.destroy();
    page = next;
    if (next === 'prototype') {
      current = mountScreenPrototype({
        product: gallery.product,
        screens: gallery.screens,
        palettes: gallery.palettes,
        defaults: prototypeDefaults,
        galleryUrl: hubPath(),
        adsToggle,
        fillPhone,
        root,
      });
      scrollTo(0, 0);
    } else {
      current = mountMarketingGallery({
        ...gallery,
        root,
        prototypeUrl: hubPath(),
        open: go,
      });
      document.title = galleryTitle;
      // After the cards have laid out.
      requestAnimationFrame(() => scrollTo(0, galleryScroll));
    }
  };

  // A view transition where the browser has one: the page cross-fades
  // instead of flashing empty between the two views.
  const swap = () => {
    const start = (
      document as Document & {startViewTransition?: (cb: () => void) => void}
    ).startViewTransition;
    // A hidden page has nothing to animate, and its transition would wait.
    if (start && document.visibilityState === 'visible')
      start.call(document, show);
    else show();
  };

  function go(href: string) {
    const url = new URL(href, location.href);
    if (url.href === location.href) return;
    // Back to the gallery this screen was opened from: step back, so the
    // history does not grow and the browser's Forward still reopens it.
    if (!isPrototype(url) && history.state?.mnwHubFrom === 'gallery') {
      history.back();
      return;
    }
    history.pushState(
      page === 'gallery' && isPrototype(url) ? {mnwHubFrom: 'gallery'} : null,
      '',
      url
    );
    swap();
  }

  // Links inside the hub that stay on this page: cards' Open buttons, card
  // titles and the prototype's All screens button.
  const onClick = (e: MouseEvent) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const link = e
      .composedPath()
      .find(
        (t): t is Element =>
          t instanceof Element &&
          t.hasAttribute('href') &&
          !!t.getAttribute('href')
      );
    if (!link || link.getAttribute('target') === '_blank') return;
    const url = new URL(link.getAttribute('href')!, location.href);
    if (url.origin !== location.origin || url.pathname !== hubPath()) return;
    if (url.hash && url.search === location.search) return;
    e.preventDefault();
    go(url.href);
  };

  addEventListener('popstate', swap);
  root.addEventListener('click', onClick);
  show();

  return {
    page: () => page,
    go,
    destroy() {
      removeEventListener('popstate', swap);
      root.removeEventListener('click', onClick);
      current?.destroy();
      current = undefined;
      history.scrollRestoration = restoration;
    },
  };
};
