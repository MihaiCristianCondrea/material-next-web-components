/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {html, render} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {
  CAPTURED_PALETTE,
  resolvePalette,
  type NavType,
  type ResolvedTheme,
} from '../domain/preview-settings.js';
import type {
  MarketingScreen,
  ScreenRegistry,
  ScreenState,
} from '../domain/screen.js';
import {windowOf, type WindowSpec} from '../domain/windows.js';
import '../ui/device-frame.js';

export interface ScreenHostOptions {
  registry: ScreenRegistry;
  id: string;
  state?: ScreenState;
  /** A palette name, or "captured" for the screen's own. */
  palette?: string;
  theme?: ResolvedTheme;
  frame?: boolean;
  navType?: NavType;
  window?: string | WindowSpec;
  showAds?: boolean;
  /** Stretch a frameless screen over its container instead of its window size. */
  fill?: boolean;
  /** Navigation out of the screen. Without it the host loads the target itself. */
  onGo?: (id: string, state: ScreenState | undefined, host: ScreenHost) => void;
  /** After set() and reset(), for panels that show the state. load() and go() do not call it. */
  onChange?: (host: ScreenHost) => void;
}

type MutableOptions = Pick<
  ScreenHostOptions,
  'palette' | 'theme' | 'frame' | 'navType' | 'window' | 'showAds' | 'fill'
>;

/**
 * One shared animation clock for screens that have `tick()`. It runs only
 * while such a screen is mounted and visible, so a hub without animated
 * screens never wakes up every frame.
 */
const ticking = new Set<ScreenHost>();
let frameId = 0;
let last = 0;

const loop = (now: number) => {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
  last = now;
  for (const host of ticking) host.step(dt);
  frameId = ticking.size ? requestAnimationFrame(loop) : 0;
  if (!frameId) last = 0;
};

const startClock = () => {
  if (!frameId) frameId = requestAnimationFrame(loop);
};

/**
 * Hosts one live screen in an element: owns its state, passes it `set()` and
 * `go()`, applies the palette and theme to the element, and draws the device
 * frame around it when asked.
 */
export class ScreenHost {
  readonly el: HTMLElement;
  screen?: MarketingScreen;
  state: ScreenState = {};
  private readonly registry: ScreenRegistry;
  private readonly opts: Omit<ScreenHostOptions, 'registry' | 'id' | 'state'>;
  private visible = true;
  private observer?: IntersectionObserver;

  constructor(
    el: HTMLElement,
    {registry, id, state = {}, ...opts}: ScreenHostOptions
  ) {
    this.el = el;
    this.registry = registry;
    this.opts = {
      palette: CAPTURED_PALETTE,
      navType: 'gesture',
      frame: false,
      showAds: false,
      ...opts,
    };
    el.classList.add('mnw-mount');
    this.load(id, state);
  }

  get options(): Readonly<MutableOptions> {
    return this.opts;
  }

  load(id: string, state: ScreenState = {}) {
    const screen = this.registry.byId(id);
    if (!screen) {
      throw new Error(
        `Unknown screen "${id}". Known: ${this.registry.screens.map((s) => s.id).join(', ')}`
      );
    }
    this.screen = screen;
    this.state = {...structuredClone(screen.defaults), ...state};
    this.syncClock();
    this.applyTheme();
    this.draw();
  }

  reset() {
    if (!this.screen) return;
    this.load(this.screen.id);
    this.opts.onChange?.(this);
  }

  setOptions(patch: MutableOptions) {
    const changed = (Object.keys(patch) as Array<keyof MutableOptions>).some(
      (key) => this.opts[key] !== patch[key]
    );
    if (!changed) return;
    Object.assign(this.opts, patch);
    this.applyTheme();
    this.draw();
  }

  set = (patch: ScreenState | ((state: ScreenState) => ScreenState)) => {
    Object.assign(
      this.state,
      typeof patch === 'function' ? patch(this.state) : patch
    );
    this.draw();
    this.opts.onChange?.(this);
  };

  go = (id: string, state?: ScreenState) =>
    this.opts.onGo ? this.opts.onGo(id, state, this) : this.load(id, state);

  /** One clock step. Called by the shared loop. */
  step(dt: number) {
    if (!dt || !this.visible || !this.screen?.tick) return;
    const patch = this.screen.tick(this.state, dt);
    if (patch) {
      Object.assign(this.state, patch);
      this.draw();
    }
  }

  destroy() {
    ticking.delete(this);
    this.observer?.disconnect();
    render(null, this.el);
  }

  private syncClock() {
    if (this.screen?.tick) {
      ticking.add(this);
      if (!this.observer && 'IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
        });
        this.observer.observe(this.el);
      }
      startClock();
    } else {
      ticking.delete(this);
    }
  }

  private applyTheme() {
    const palette = resolvePalette(
      this.opts.palette ?? CAPTURED_PALETTE,
      this.screen?.palette
    );
    if (palette) this.el.dataset.palette = palette;
    else delete this.el.dataset.palette;
    if (this.opts.theme === 'dark') this.el.dataset.theme = 'dark';
    else delete this.el.dataset.theme;
    this.el.classList.toggle(
      'mnw-mount--fill',
      !!this.opts.fill && !this.opts.frame
    );
  }

  draw() {
    const screen = this.screen;
    if (!screen) return;
    const navType =
      this.opts.navType ?? (this.state.navType as NavType) ?? 'gesture';
    // The window and ads belong to the host, not the screen: they hold across navigation.
    const win =
      this.opts.window ??
      (this.state.window as string | WindowSpec | undefined);
    const showAds = this.opts.showAds ?? false;
    const tpl = screen.render({
      ...this.state,
      window: win,
      showAds,
      set: this.set,
      go: this.go,
      navType,
    });
    const device = windowOf(win).device;
    const framed =
      this.opts.frame && device
        ? html`<mnw-device-frame
            device=${device}
            tone=${this.opts.theme ?? 'light'}
            >${tpl}</mnw-device-frame
          >`
        : tpl;
    render(keyed(screen.id, framed), this.el);
  }
}
