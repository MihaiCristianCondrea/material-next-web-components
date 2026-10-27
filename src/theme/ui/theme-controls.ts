/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  DEFAULT_SOURCE_COLOR,
  normalizeHex,
  type ColorMode,
} from '../domain/color-theme.js';
import {
  createThemePreferenceStore,
  type ThemePreference,
  type ThemePreferenceStore,
} from '../data/theme-preference-store.js';
import {applyColorTheme} from './apply-color-theme.js';
import './color-picker.js';
import type {MaterialNextColorPicker} from './color-picker.js';
import {styles} from './theme-controls-styles.js';

export type ColorThemeChangeEvent = CustomEvent<ThemePreference>;

const MODES: ReadonlyArray<readonly [ColorMode, string, string]> = [
  ['dark', 'Dark', 'dark_mode'],
  ['system', 'System', 'brightness_medium'],
  ['light', 'Light', 'light_mode'],
];

/**
 * A page's theme controls: a source color (hex swatch and HCT sliders), the
 * color mode, and a reset to the page's own colors.
 *
 * Controlled by default: set `source-color` and `mode`, and apply each
 * `color-theme-change` yourself. Set `storage-key` (or `store`) to persist the
 * choice, and `apply` to theme the document as well.
 *
 * @fires color-theme-change - `{sourceColor?, mode}` after each change; no `sourceColor` means the page's own colors.
 */
@customElement('mnw-theme-controls')
export class MaterialNextThemeControls extends LitElement {
  static override styles = styles;

  /** The chosen source color; empty keeps the page's own colors. */
  @property({attribute: 'source-color'}) sourceColor = '';

  /** Light, dark or the system's choice. */
  @property() mode: ColorMode = 'system';

  /** Shown in the picker until a color is chosen: the page's own seed. */
  @property({attribute: 'default-color'}) defaultColor = DEFAULT_SOURCE_COLOR;

  @property() heading = 'Theme';

  /** Persist under this localStorage key; empty persists nothing. */
  @property({attribute: 'storage-key'}) storageKey = '';

  /** A store of your own, instead of `storage-key`. */
  @property({attribute: false}) store?: ThemePreferenceStore;

  /** Theme this element's document on every change. */
  @property({type: Boolean}) apply = false;

  private activeStore?: ThemePreferenceStore;
  private unsubscribe?: () => void;

  override disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.activeStore = undefined;
    super.disconnectedCallback();
  }

  override connectedCallback() {
    super.connectedCallback();
    // A moved element reconnects to its store.
    if (this.hasUpdated) this.connectStore();
  }

  /** The current choice, as `color-theme-change` reports it. */
  get preference(): ThemePreference {
    const sourceColor = normalizeHex(this.sourceColor);
    return sourceColor ? {sourceColor, mode: this.mode} : {mode: this.mode};
  }

  /** Back to the page's own colors; the mode stays. */
  reset() {
    this.commit({mode: this.mode});
  }

  private connectStore() {
    this.unsubscribe?.();
    this.activeStore =
      this.store ??
      (this.storageKey
        ? createThemePreferenceStore({key: this.storageKey})
        : undefined);
    this.unsubscribe = undefined;
    if (!this.activeStore) return;
    this.take(this.activeStore.load());
    this.unsubscribe = this.activeStore.subscribe((p) => this.take(p));
  }

  private take(preference: ThemePreference) {
    this.sourceColor = preference.sourceColor ?? '';
    this.mode = preference.mode;
    if (this.apply) applyColorTheme(preference, {document: this.ownerDocument});
  }

  private commit(preference: ThemePreference, emit = true) {
    this.sourceColor = preference.sourceColor ?? '';
    this.mode = preference.mode;
    if (this.apply) applyColorTheme(preference, {document: this.ownerDocument});
    if (preference.sourceColor) this.activeStore?.save(preference);
    else if (preference.mode === 'system') this.activeStore?.reset();
    else this.activeStore?.save(preference);
    if (!emit) return;
    this.dispatchEvent(
      new CustomEvent('color-theme-change', {
        detail: preference,
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('store') || changed.has('storageKey')) this.connectStore();
    else if (changed.has('apply') && this.apply)
      applyColorTheme(this.preference, {document: this.ownerDocument});
  }

  private onColor(e: Event) {
    const value = (e.target as MaterialNextColorPicker).value;
    this.commit({sourceColor: value, mode: this.mode});
  }

  private onMode(e: CustomEvent<{selected: boolean; index: number}>) {
    if (!e.detail.selected) return;
    this.commit({...this.preference, mode: MODES[e.detail.index][0]});
  }

  override render() {
    const custom = !!normalizeHex(this.sourceColor);
    return html`<div class="header">
        <h2 class="heading">${this.heading}</h2>
        ${
          custom
            ? html`<md-icon-button
                class="reset"
                aria-label="Use the default colors"
                title="Use the default colors"
                @click=${() => this.reset()}
                ><md-icon>restart_alt</md-icon></md-icon-button
              >`
            : nothing
        }
      </div>
      <mnw-color-picker
        .value=${custom ? this.sourceColor : this.defaultColor}
        @input=${this.onColor}
      ></mnw-color-picker>
      <md-outlined-segmented-button-set
        aria-label="Color mode"
        @segmented-button-set-selection=${this.onMode}
      >
        ${MODES.map(
          ([mode, label, icon]) =>
            html`<md-outlined-segmented-button
              aria-label="${label} color mode"
              title=${label}
              .selected=${this.mode === mode}
              hasIcon
              ><md-icon slot="icon"
                >${icon}</md-icon
              ></md-outlined-segmented-button
            >`
        )}
      </md-outlined-segmented-button-set>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-theme-controls': MaterialNextThemeControls;
  }
  interface HTMLElementEventMap {
    'color-theme-change': ColorThemeChangeEvent;
  }
}
