/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from app-shell.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    --_drawer-width: var(--mnw-app-shell-drawer-width, 264px);
    --_bar-height: var(--mnw-app-shell-top-app-bar-height, 72px);
    --_radius: var(--mnw-app-shell-pane-radius, 28px);
    --_frame: var(--md-sys-color-surface-container-low, #f3f4f9);
    --_surface: var(--md-sys-color-surface, #f9f9ff);
    --_scrolled: var(--md-sys-color-surface-container, #edeef4);
    --_on-surface: var(--md-sys-color-on-surface, #1b1c1e);
    --_on-surface-variant: var(--md-sys-color-on-surface-variant, #44474c);
    --_outline-variant: var(--md-sys-color-outline-variant, #c4c7cd);
    --_enter: cubic-bezier(0.05, 0.7, 0.1, 1);
    --_exit: cubic-bezier(0.3, 0, 0.8, 0.15);
    display: block;
    min-height: 100dvh;
    background: var(--_surface);
    color: var(--_on-surface);
  }

  .frame {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-height: inherit;
  }

  :host([layout='permanent']) .frame {
    grid-template-columns: var(--_drawer-width) minmax(0, 1fr);
  }

  .skip {
    position: absolute;
    z-index: 20;
    top: 8px;
    inset-inline-start: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    background: var(--md-sys-color-primary, #0b57d0);
    color: var(--md-sys-color-on-primary, #ffffff);
    font-weight: 500;
    text-decoration: none;
    transform: translateY(-200%);
  }

  .skip:focus-visible {
    transform: none;
  }

  :host([navigation-mode='none']) .drawer {
    display: none;
  }

  .drawer {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--_frame);
    color: inherit;
    overflow: hidden;
  }

  :host([layout='permanent']) .drawer {
    position: sticky;
    top: 0;
    height: 100dvh;
  }

  .drawer[popover],
  :host([layout='modal']) .drawer {
    position: fixed;
    z-index: 30;
    inset: 0 auto 0 0;
    width: min(var(--mnw-app-shell-modal-drawer-width, 320px), 100% - 56px);
    height: 100dvh;
    max-height: none;
    border-start-end-radius: 16px;
    border-end-end-radius: 16px;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.16),
      0 2px 6px rgba(0, 0, 0, 0.12);
    transform: none;
    transition:
      transform 250ms var(--_enter),
      overlay 250ms allow-discrete,
      display 250ms allow-discrete;
  }

  @supports not selector(:popover-open) {
    :host([layout='modal']) .drawer:not([data-open]) {
      display: none;
    }
  }
  .drawer[popover]:not(:popover-open) {
    display: none;
    transform: translateX(-100%);
    transition-duration: 200ms;
    transition-timing-function: var(--_exit);
  }

  :host(:dir(rtl)) .drawer[popover] {
    inset: 0 0 0 auto;
  }

  :host(:dir(rtl)) .drawer[popover]:not(:popover-open) {
    transform: translateX(100%);
  }

  .drawer::backdrop {
    background: rgba(0, 0, 0, 0.32);
    opacity: 1;
    transition:
      opacity 250ms linear,
      overlay 250ms allow-discrete,
      display 250ms allow-discrete;
  }

  .drawer:not(:popover-open)::backdrop {
    opacity: 0;
  }

  .drawer:popover-open {
    animation: drawer-in 250ms var(--_enter);
  }

  :host(:dir(rtl)) .drawer:popover-open {
    animation-name: drawer-in-rtl;
  }

  .drawer:popover-open::backdrop {
    animation: scrim-in 250ms linear;
  }

  @keyframes drawer-in {
    from {
      transform: translateX(-100%);
    }
  }
  @keyframes drawer-in-rtl {
    from {
      transform: translateX(100%);
    }
  }
  @keyframes scrim-in {
    from {
      opacity: 0;
    }
  }
  .drawer-header {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    min-height: var(--_bar-height);
    padding: 0 12px 0 24px;
  }

  .drawer-heading {
    margin: 0;
    overflow: hidden;
    color: var(--_on-surface);
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .brand {
    flex: none;
    padding: 20px 24px 8px;
  }

  .brand[hidden] {
    display: none;
  }

  .destinations {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    padding: 8px 12px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .footer {
    flex: none;
    padding: 0 12px 12px;
  }

  :host([navigation-size='large']) .drawer {
    --mnw-navigation-item-height: 56px;
    --mnw-navigation-item-label-size: 1rem;
    --mnw-navigation-item-line-height: 1.5rem;
  }

  :host([appearance='outlined']) {
    --_frame: var(--_surface);
    --_radius: 0px;
  }

  :host([appearance='outlined']) .drawer-header {
    border-bottom: 1px solid var(--_outline-variant);
  }

  :host([appearance='outlined'][layout='permanent']) .drawer {
    border-inline-end: 1px solid var(--_outline-variant);
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .sentinel {
    height: 1px;
    margin-bottom: -1px;
  }

  .bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    min-height: var(--_bar-height);
    padding: 12px 24px;
    background: var(--_surface);
    transition: background-color 150ms linear;
  }

  :host([scrolled][layout='modal']:not([appearance='outlined'])) .bar {
    background: var(--_scrolled);
  }

  :host([appearance='outlined']) .bar {
    border-bottom: 1px solid var(--_outline-variant);
  }

  :host([appearance='outlined'][layout='permanent']) .bar::after {
    display: none;
  }

  .leading {
    flex: none;
    margin-inline-start: -8px;
  }

  .headline {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    outline: none;
    font-size: 1.375rem;
    font-weight: 500;
    line-height: 1.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
  }

  .content {
    flex: 1 0 auto;
    min-width: 0;
    outline: none;
    background: var(--_surface);
  }

  :host([layout='permanent']) .main,
  :host([layout='permanent']) .bar {
    background: var(--_frame);
  }

  :host([layout='permanent']) .bar::after {
    content: '';
    position: absolute;
    top: 100%;
    inset-inline-start: 0;
    width: var(--_radius);
    height: var(--_radius);
    pointer-events: none;
    background: radial-gradient(
      circle at 100% 100%,
      transparent calc(var(--_radius) - 0.5px),
      var(--_frame) var(--_radius)
    );
  }

  :host([layout='permanent']:dir(rtl)) .bar::after {
    background: radial-gradient(
      circle at 0 100%,
      transparent calc(var(--_radius) - 0.5px),
      var(--_frame) var(--_radius)
    );
  }

  :host([layout='permanent']) .content {
    border-start-start-radius: var(--_radius);
  }

  .frame--compact {
    --_bar-height: var(--mnw-app-shell-top-app-bar-height, 64px);
  }
  .frame--compact .bar {
    gap: 8px;
    padding: 8px 16px;
  }
  .frame--compact .headline {
    font-size: 1.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer,
    .drawer::backdrop,
    .bar {
      transition: none;
      animation: none;
    }
  }
`;
