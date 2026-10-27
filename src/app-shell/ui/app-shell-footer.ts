/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './app-shell-footer-styles.js';

export type AppShellTheme = 'light' | 'dark' | 'system';
export type AppShellThemeChangeEvent = CustomEvent<{theme: AppShellTheme}>;
const themes = [
  ['light', 'Light', 'light_mode'],
  ['dark', 'Dark', 'dark_mode'],
  ['system', 'System', 'brightness_auto'],
] as const;

/**
 * Drawer footer with a theme selector and optional policy links, matching the
 * Android Insider and GitHub Dev Tools footers. The host applies the theme.
 * @fires theme-change - `{theme}`: the requested Light, Dark or System theme.
 */
@customElement('mnw-app-shell-footer')
export class MaterialNextAppShellFooter extends LitElement {
  static override styles = styles;

  /** Selected theme; the host owns persistence and colour tokens. */
  @property() theme: AppShellTheme = 'system';
  /** Privacy policy URL; empty hides the link. */
  @property({attribute: 'privacy-href'}) privacyHref = '';
  /** Code of conduct URL; empty hides the link. */
  @property({attribute: 'code-of-conduct-href'}) codeOfConductHref = '';

  private pick(event: Event, theme: AppShellTheme) {
    const button = event.currentTarget as HTMLElement & {selected: boolean};
    button.selected = this.theme === theme;
    if (theme === this.theme) return;
    this.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: {theme},
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`<p class="label">Theme</p>
      <div class="themes" role="group" aria-label="Theme">
        ${themes.map(
          ([theme, label, icon]) =>
            html`<md-icon-button
              toggle
              .selected=${theme === this.theme}
              ?data-active=${theme === this.theme}
              aria-label=${`${label} theme`}
              title=${`${label} theme`}
              @change=${(event: Event) => this.pick(event, theme)}
            >
              <md-icon>${icon}</md-icon
              ><md-icon slot="selected">${icon}</md-icon>
            </md-icon-button>`
        )}
      </div>
      ${
        this.privacyHref || this.codeOfConductHref
          ? html`<nav class="links" aria-label="Policies">
              ${this.privacyHref ? html`<a href=${this.privacyHref} target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : nothing}
              ${this.privacyHref && this.codeOfConductHref ? html`<span aria-hidden="true">·</span>` : nothing}
              ${this.codeOfConductHref ? html`<a href=${this.codeOfConductHref} target="_blank" rel="noopener noreferrer">Code of Conduct</a>` : nothing}
            </nav>`
          : nothing
      }`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mnw-app-shell-footer': MaterialNextAppShellFooter;
  }
  interface HTMLElementEventMap {
    'theme-change': AppShellThemeChangeEvent;
  }
}
