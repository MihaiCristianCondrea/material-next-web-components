/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';
import './app-showcase.js';
import './code-block.js';
import './expressive-tab-bar.js';
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './material-next-home-styles.js';

const appTabs = [
  {label: 'Home', icon: 'home', href: '#home'},
  {label: 'Examples', icon: 'widgets', href: '#examples'},
];

const exampleTabs = [
  {label: 'Expressive tab bar', icon: 'tab', href: '#expressive-tab-bar'},
  {label: 'App showcase', icon: 'apps', href: '#app-showcase'},
  {label: 'Code block', icon: 'code', href: '#code-block'},
  {label: 'Table of contents', icon: 'toc', href: '#table-of-contents'},
];

/**
 * Home and examples app shell for material-next-web-components.
 *
 * @slot - Optional supporting content displayed below the home content.
 * @csspart action - The Material Design call-to-action button.
 */
@customElement('mnw-home')
export class MaterialNextHome extends LitElement {
  static override styles = styles;

  /** The main headline shown in the home hero. */
  @property()
  headline = 'material-next-web-components';

  /** The URL opened by the install call-to-action button. */
  @property({attribute: 'docs-href'})
  docsHref = './install/';

  @state()
  private activeView: 'home' | 'examples' = 'home';

  @state()
  private activeExampleIndex = 0;

  override render() {
    return html`
      <section class="app-shell">
        <header class="top-app-bar">
          <a class="brand" href="#home" @click=${this.showHome}>
            <span class="brand-mark">M</span>
            <span>material-next-web-components</span>
          </a>
          <md-expressive-tab-bar
            class="view-tabs"
            icon-position="start"
            .tabs=${appTabs}
            .activeIndex=${this.activeView === 'home' ? 0 : 1}
            @navigate=${this.handleAppNavigation}
          ></md-expressive-tab-bar>
        </header>

        <main>
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
        <section class="hero-card">
          <p class="eyebrow">Material Next Web Components</p>
          <h1>${this.headline}</h1>
          <p class="tagline">
            Built-in Lit custom elements and product views powered by Material
            Design.
          </p>
        </section>

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
        <slot></slot>
      </article>
    `;
  }

  private renderExamplesView() {
    return html`
      <article class="examples-view" id="examples">
        <aside class="example-nav" aria-label="Examples navigation">
          <p class="nav-heading">Examples</p>
          <md-expressive-tab-bar
            class="tree-tabs"
            icon-position="start"
            .tabs=${exampleTabs}
            .activeIndex=${this.activeExampleIndex}
            @navigate=${this.handleExampleNavigation}
          ></md-expressive-tab-bar>
        </aside>

        <section class="example-content">
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

          <section id="table-of-contents" class="example-panel toc-panel">
            <h2>Table of contents</h2>
            <nav aria-label="Page table of contents">
              <a href="#expressive-tab-bar">Expressive tab bar</a>
              <a href="#app-showcase">App showcase</a>
              <a href="#code-block">Code block</a>
            </nav>
          </section>
        </section>
      </article>
    `;
  }

  private showHome(event: Event) {
    event.preventDefault();
    this.activeView = 'home';
  }

  private handleAppNavigation(event: CustomEvent) {
    event.preventDefault();
    this.activeView = event.detail.index === 0 ? 'home' : 'examples';
  }

  private handleExampleNavigation(event: CustomEvent) {
    event.preventDefault();
    this.activeExampleIndex = event.detail.index;
    const item = event.detail.item as {href?: string};
    if (!item.href) {
      return;
    }

    this.updateComplete.then(() => {
      this.renderRoot.querySelector(item.href ?? '')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-home': MaterialNextHome;
  }
}
