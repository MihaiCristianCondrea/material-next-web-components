/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';
import './app-showcase.js';
import './code-block.js';
import './docs-table-of-contents.js';
import './docs-vertical-tabs.js';
import './expressive-tab-bar.js';
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  appNavigationItems,
  exampleNavigationItems,
  exampleTableOfContentsItems,
} from './docs-navigation.js';
import {styles} from './material-next-home-styles.js';

/**
 * Home and examples app shell for material-next-web-components.
 *
 * @slot - Optional supporting content displayed below the home content.
 * @csspart action - The Material Design call-to-action button.
 */
@customElement('mnw-home')
export class MaterialNextHome extends LitElement {
  static override styles = styles;

  /** The URL opened by the install call-to-action button. */
  @property({attribute: 'docs-href'})
  docsHref = './install/';

  @state()
  private activeView: 'home' | 'examples' = 'home';

  @state()
  private activeExampleIndex = 0;

  @state()
  private activeTocIndex = 0;

  private routeChangeController?: AbortController;

  override connectedCallback() {
    super.connectedCallback();
    this.syncRouteFromLocation({scroll: false});

    this.routeChangeController = new AbortController();
    window.addEventListener('hashchange', this.handleRouteChange, {
      signal: this.routeChangeController.signal,
    });
    window.addEventListener('popstate', this.handleRouteChange, {
      signal: this.routeChangeController.signal,
    });
  }

  override disconnectedCallback() {
    this.routeChangeController?.abort();
    this.routeChangeController = undefined;
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <section class="app-shell">
        <header class="top-app-bar">
          <md-expressive-tab-bar
            class="view-tabs"
            icon-position="start"
            .tabs=${appNavigationItems}
            .activeIndex=${this.activeView === 'home' ? 0 : 1}
            @navigate=${this.handleAppNavigation}
          ></md-expressive-tab-bar>
        </header>

        <main class="docs-content" tabindex="-1">
          ${this.activeView === 'home'
            ? this.renderHomeView()
            : this.renderExamplesView()}
        </main>
      </section>
    `;
  }

  private renderHomeView() {
    return html`
      <article class="home-view" id="home">
        <section class="content-grid" aria-label="Home documentation">
          <article class="info-card">
            <h2>Introduction</h2>
            <p>
              This package wraps Material Web primitives into product-ready Lit
              components, including navigation, showcase, and code presentation
              views you can drop into an application shell.
            </p>
          </article>

          <article class="info-card notice-card">
            <h2>Material Web experimental notice</h2>
            <p>
              Experimental components from Material Web can be used with no
              doubt in this project: wrap them behind the stable
              material-next-web-components API, document the behavior, and keep
              upgrades centralized here.
            </p>
          </article>

          <article class="info-card install-card">
            <h2>Install</h2>
            <p>Install the package and its Material Web peer dependency.</p>
            <mnw-code-block
              language="bash"
              copy
              code="npm install material-next-web-components @material/web lit"
            ></mnw-code-block>
          </article>

          <article class="info-card">
            <h2>npm usage</h2>
            <p>Import the custom elements once, then use them in HTML.</p>
            <mnw-code-block
              language="ts"
              copy
              code="import 'material-next-web-components/material-next-home.js';
import 'material-next-web-components/expressive-tab-bar.js';"
            ></mnw-code-block>
            <md-filled-button href=${this.docsHref} part="action">
              Open install docs
            </md-filled-button>
          </article>
        </section>

        <footer class="home-summary">
          <h1>material-next-web-components</h1>
          <p class="tagline">
            Built-in Lit custom elements and product views powered by Material
            Design.
          </p>
        </footer>
        <slot></slot>
      </article>
    `;
  }

  private renderExamplesView() {
    return html`
      <article class="examples-view" id="examples">
        <aside class="example-nav">
          <mnw-docs-vertical-tabs
            .items=${exampleNavigationItems}
            .activeIndex=${this.activeExampleIndex}
            @navigate=${this.handleExampleNavigation}
          ></mnw-docs-vertical-tabs>
        </aside>

        <section class="example-content">
          <section id="examples-overview" class="example-panel">
            <h2>Examples</h2>
            <p>
              Browse reusable Material Next Web Components with separated
              library navigation and page contents.
            </p>
          </section>
          <section id="expressive-tab-bar" class="example-panel">
            <h2>Expressive tab bar</h2>
            <p>
              Icons can be placed on the top, bottom, start, or end of each tab.
            </p>
            <md-expressive-tab-bar icon-position="top"></md-expressive-tab-bar>
            <md-expressive-tab-bar
              icon-position="bottom"
            ></md-expressive-tab-bar>
          </section>

          <section id="app-showcase" class="example-panel">
            <h2>App showcase</h2>
            <mnw-app-showcase limit="3"></mnw-app-showcase>
          </section>

          <section id="code-block" class="example-panel">
            <h2>Code block</h2>
            <mnw-code-block
              language="html"
              copy
              code='<md-expressive-tab-bar icon-position="end"></md-expressive-tab-bar>'
            ></mnw-code-block>
          </section>
        </section>

        <aside class="toc-nav">
          <mnw-docs-table-of-contents
            .items=${exampleTableOfContentsItems}
            .activeIndex=${this.activeTocIndex}
            @navigate=${this.handleTocNavigation}
          ></mnw-docs-table-of-contents>
        </aside>
      </article>
    `;
  }

  private handleAppNavigation(event: CustomEvent) {
    event.preventDefault();
    const item = event.detail.item as {href?: string};
    this.navigateToHash(
      item.href ?? (event.detail.index === 0 ? '#home' : '#examples')
    );
  }

  private handleExampleNavigation(event: CustomEvent) {
    event.preventDefault();
    const item = event.detail.item as {href?: string};
    if (!item.href) {
      return;
    }

    this.navigateToHash(item.href);
  }

  private handleTocNavigation(event: CustomEvent) {
    event.preventDefault();
    const item = event.detail.item as {href?: string};
    if (item.href) {
      this.navigateToHash(item.href);
    }
  }

  private readonly handleRouteChange = () => {
    this.syncRouteFromLocation({scroll: true});
  };

  private navigateToHash(hash: string) {
    const targetHash = hash || '#home';
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }

    this.syncRouteFromLocation({scroll: true});
  }

  private syncRouteFromLocation({scroll}: {scroll: boolean}) {
    const hash = window.location.hash || '#home';
    const exampleIndex = exampleNavigationItems.findIndex(
      (tab) => tab.href === hash
    );

    const tocIndex = exampleTableOfContentsItems.findIndex(
      (item) => item.href === hash
    );

    if (hash === '#examples' || exampleIndex >= 0 || tocIndex >= 0) {
      this.activeView = 'examples';
      this.activeExampleIndex = exampleIndex >= 0 ? exampleIndex : 0;
      this.activeTocIndex = tocIndex >= 0 ? tocIndex : 0;
    } else {
      this.activeView = 'home';
      this.activeExampleIndex = 0;
      this.activeTocIndex = 0;
    }

    if (!scroll) {
      return;
    }

    this.updateComplete.then(() => {
      const target =
        this.getHashTarget(hash) ??
        (this.activeView === 'examples'
          ? this.getHashTarget(
              exampleNavigationItems[this.activeExampleIndex]?.href ?? ''
            )
          : null);

      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  private getHashTarget(hash: string) {
    if (!hash.startsWith('#')) {
      return null;
    }

    const id = decodeURIComponent(hash.slice(1));
    const target = this.shadowRoot?.getElementById(id);
    if (target) {
      return target;
    }

    try {
      return this.renderRoot.querySelector(hash);
    } catch {
      return null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-home': MaterialNextHome;
  }
}
