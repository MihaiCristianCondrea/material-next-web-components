/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/outlined-button.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/icon/icon.js';
import '@material/web/progress/circular-progress.js';
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './app-showcase-styles.js';

export interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  iconUrl: string;
  storeUrl: string;
}

interface AndroidAppCategoryDto {
  label?: string;
  category_id?: string;
}

interface AndroidAppApiDto {
  appName?: string;
  name?: string;
  title?: string;
  packageName?: string;
  package?: string;
  category?: string | AndroidAppCategoryDto;
  appCategory?: string | AndroidAppCategoryDto;
  shortDescription?: string;
  description?: string;
  summary?: string;
  icon?: string;
  iconUrl?: string;
  iconLogo?: string;
  image?: string;
  storeUrl?: string;
  googlePlayUrl?: string;
  url?: string;
}

type AndroidAppsApiDto =
  | AndroidAppApiDto[]
  | {
      apps?: AndroidAppApiDto[];
      data?: AndroidAppApiDto[] | {apps?: AndroidAppApiDto[]};
      promotedApps?: AndroidAppApiDto[];
      androidApps?: AndroidAppApiDto[];
    };

const defaultAppsEndpoint =
  'https://mihaicristiancondrea.github.io/com.d4rk.apis/api/app_toolkit/v2/release/en/home/api_android_apps.json';
const defaultStoreUrl =
  'https://play.google.com/store/apps/dev?id=5390214922640123642';

const cachedApps = new Map<string, AppItem[]>();
const inFlightRequests = new Map<string, Promise<AppItem[]>>();

/** A Material app showcase that fetches and renders promoted Android apps. */
@customElement('mnw-app-showcase')
export class MaterialNextAppShowcase extends LitElement {
  static override styles = styles;

  /** API endpoint returning Android app metadata. */
  @property({attribute: 'apps-endpoint'})
  appsEndpoint = defaultAppsEndpoint;

  /** Link used by the section-level “View all apps” action. */
  @property({attribute: 'store-href'})
  storeHref = defaultStoreUrl;

  /** Section heading. */
  @property()
  headline = 'More apps from Mihai-Cristian';

  /** Maximum number of apps to render. */
  @property({type: Number})
  limit = 6;

  @state()
  private apps: AppItem[] = [];

  @state()
  private isLoading = true;

  @state()
  private errorMessage = '';

  private allApps: AppItem[] = [];

  override connectedCallback() {
    super.connectedCallback();
    void this.loadApps();
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('appsEndpoint')) {
      void this.loadApps();
      return;
    }

    if (changedProperties.has('limit')) {
      this.apps = this.allApps.slice(0, this.limit);
    }
  }

  override render() {
    return html`
      <section class="showcase-section" aria-labelledby="showcase-title">
        <div class="section-heading">
          <h2 id="showcase-title">${this.headline}</h2>
          <md-outlined-button
            class="view-all-link"
            href=${this.storeHref}
            target="_blank"
            aria-label="View all apps on Google Play"
          >
            <md-icon slot="icon">open_in_new</md-icon>
            View all apps
          </md-outlined-button>
        </div>
        ${this.renderContent()}
      </section>
    `;
  }

  private renderContent() {
    if (this.isLoading) {
      return html`<div class="showcase-loading">
        <md-circular-progress
          indeterminate
          aria-label="Loading apps"
        ></md-circular-progress>
        <span>Loading apps…</span>
      </div>`;
    }

    if (this.errorMessage) {
      return html`<div class="showcase-error">${this.errorMessage}</div>`;
    }

    return html`<div class="apps-grid">
      ${this.apps.map(
        (app) =>
          html`<md-outlined-card class="app-card">
            <div class="app-icon">
              ${app.iconUrl
                ? html`<img src=${app.iconUrl} alt="" loading="lazy" />`
                : html`<md-icon class="app-icon-placeholder">apps</md-icon>`}
            </div>
            <div class="app-content">
              <h3>${app.name}</h3>
              <p class="app-category">${app.category}</p>
              <p>${app.description}</p>
            </div>
            <md-outlined-button
              class="play-link"
              href=${app.storeUrl}
              target="_blank"
              aria-label="Open ${app.name} on Google Play"
            >
              <md-icon slot="icon">store</md-icon>
              Google Play
            </md-outlined-button>
          </md-outlined-card>`
      )}
    </div>`;
  }

  private async loadApps() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.allApps = await fetchPromotedApps(this.appsEndpoint);
      this.apps = this.allApps.slice(0, this.limit);
      if (this.apps.length === 0) {
        this.errorMessage = 'No apps are available right now.';
      }
    } catch (error) {
      console.error(error);
      this.errorMessage =
        'Could not load app recommendations. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }
}

async function fetchPromotedApps(endpoint: string): Promise<AppItem[]> {
  const cached = cachedApps.get(endpoint);
  if (cached) {
    return cached;
  }

  const inFlight = inFlightRequests.get(endpoint);
  if (inFlight) {
    return inFlight;
  }

  const request = fetch(endpoint, {headers: {Accept: 'application/json'}})
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Apps API returned ${response.status}`);
      }
      return response.json() as Promise<AndroidAppsApiDto>;
    })
    .then(mapAndroidApps);
  inFlightRequests.set(endpoint, request);

  try {
    const apps = await request;
    cachedApps.set(endpoint, apps);
    return apps;
  } finally {
    inFlightRequests.delete(endpoint);
  }
}

function mapAndroidApps(response: AndroidAppsApiDto): AppItem[] {
  return extractApps(response)
    .map((app, index) => mapAndroidApp(app, index))
    .filter((app): app is AppItem => Boolean(app));
}

function extractApps(response: AndroidAppsApiDto): AndroidAppApiDto[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return (
    response.apps ??
    response.data?.apps ??
    response.promotedApps ??
    response.androidApps ??
    []
  );
}

function mapAndroidApp(app: AndroidAppApiDto, index: number): AppItem | null {
  const packageName = app.packageName ?? app.package;
  const name = app.appName ?? app.name ?? app.title;
  if (!name || !packageName) {
    return null;
  }

  return {
    id: packageName || `app-${index}`,
    name,
    category: mapCategory(app.category ?? app.appCategory),
    description: shortDescription(
      app.shortDescription ?? app.description ?? app.summary
    ),
    iconUrl: app.iconUrl ?? app.iconLogo ?? app.icon ?? app.image ?? '',
    storeUrl:
      app.storeUrl ??
      app.googlePlayUrl ??
      app.url ??
      `https://play.google.com/store/apps/details?id=${packageName}`,
  };
}

function mapCategory(category: string | AndroidAppCategoryDto | undefined) {
  if (!category) {
    return 'Android app';
  }

  if (typeof category === 'string') {
    return category;
  }

  return category.label ?? category.category_id ?? 'Android app';
}

function shortDescription(description: string | undefined) {
  const fallback = 'Explore another lightweight app from Mihai-Cristian.';
  if (!description) {
    return fallback;
  }

  const firstLine = description.split('\n').find((line) => line.trim());
  return firstLine?.trim() ?? fallback;
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-app-showcase': MaterialNextAppShowcase;
  }
}
