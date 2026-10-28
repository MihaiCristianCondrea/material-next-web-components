/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Generated from android-screen.scss.
 * Do not edit directly; run npm run build:scss.
 */

import {css} from 'lit';
import {scrollbarStyles} from '../../scrollbar-styles.js';

export const styles = css`
  ${scrollbarStyles}
  :host {
    position: relative;
    display: flex;
    flex-direction: column;
    width: var(--_width, 430px);
    height: var(--_height, 957px);
    overflow: hidden;
    isolation: isolate;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    --_font: var(
      --md-ref-typeface-plain,
      'Google Sans Flex',
      Roboto,
      sans-serif
    );
    font-family: var(--_font);
    -webkit-font-smoothing: antialiased;
    --_bottom-bar: 0px;
    --_system-nav: 0px;
    --md-icon-font: 'Material Symbols Outlined';
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button {
    font: inherit;
  }

  .rounded {
    --md-icon-font: 'Material Symbols Rounded';
    font-family: 'Material Symbols Rounded';
  }

  .filled {
    font-variation-settings: 'FILL' 1;
  }

  .status {
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
    transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
    --md-icon-size: 16px;
  }

  .status__icons {
    display: flex;
    gap: 6px;
    opacity: 0.85;
  }

  .topbar {
    height: 64px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1);
    --md-icon-button-icon-color: var(--md-sys-color-on-surface);
  }

  .topbar > md-icon-button {
    margin-inline: 4px;
    flex-shrink: 0;
  }

  .topbar > .actions md-icon-button {
    margin-inline: 4px;
    --md-icon-button-icon-color: var(--md-sys-color-on-surface-variant);
  }

  .topbar--no-nav {
    padding-inline-start: 16px;
  }

  .actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    position: relative;
  }

  .title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font: 400 22px/28px var(--_font);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .topbar--center .title {
    text-align: center;
  }

  .topbar--large {
    height: auto;
    flex-direction: column;
    align-items: stretch;
  }

  .topbar--large .row {
    height: 64px;
    display: flex;
    align-items: center;
  }

  .topbar--large .row .title {
    opacity: var(--_title-opacity, 0);
  }

  .large-title {
    overflow: hidden;
    height: calc((1 - var(--_collapse, 0)) * 88px);
    display: flex;
    align-items: flex-end;
    padding: 0 16px 16px;
    font: 400 28px/36px var(--_font);
    opacity: calc(1 - var(--_title-opacity, 0));
  }

  .search {
    flex: 1;
    min-width: 0;
    margin-inline-end: 8px;
    --md-filled-text-field-icon-input-space: 8px;
    --md-filled-text-field-container-shape: 24px;
    --md-filled-text-field-container-color: var(
      --md-sys-color-surface-container-high
    );
    --md-filled-text-field-active-indicator-height: 0px;
    --md-filled-text-field-hover-active-indicator-height: 0px;
    --md-filled-text-field-focus-active-indicator-height: 0px;
    --md-filled-field-top-space: 12px;
    --md-filled-field-bottom-space: 12px;
    --md-filled-text-field-leading-icon-color: var(--md-sys-color-on-surface);
  }

  .topbar--no-nav .search {
    margin-inline-start: 0;
  }

  :host([data-scrolled]) .status,
  :host([data-scrolled]) .topbar {
    background: var(--md-sys-color-surface-container);
  }

  .content {
    flex: 1;
    min-height: 0;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  .fab {
    position: absolute;
    inset-inline-end: 16px;
    bottom: calc(16px + var(--_bottom-bar));
    z-index: 3;
  }

  :host([data-framed]) .fab {
    bottom: calc(16px + var(--_system-nav));
  }

  .bottom {
    flex-shrink: 0;
  }

  .body {
    flex: 1;
    min-height: 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    flex-shrink: 0;
    height: 80px;
    display: flex;
    gap: 8px;
    background: var(--md-sys-color-surface-container);
  }

  .navbar__item {
    all: unset;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding-bottom: 4px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
    -webkit-tap-highlight-color: transparent;
  }

  .navbar__indicator {
    width: 56px;
    height: 32px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    --md-icon-size: 24px;
  }

  .navbar__label {
    font: 500 12px/16px var(--_font);
    letter-spacing: 0.5px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .navbar__item[aria-current='page'] {
    color: var(--md-sys-color-secondary);
  }

  .navbar__item[aria-current='page'] .navbar__indicator {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  .navbar__item:focus-visible .navbar__indicator {
    outline: 2px solid var(--md-sys-color-secondary);
  }

  .sysnav {
    flex-shrink: 0;
    width: 100%;
    color: var(--md-sys-color-on-surface);
  }

  .sysnav--under-bar {
    background: var(--md-sys-color-surface-container);
  }

  .sysnav--gesture {
    height: 24px;
    display: grid;
    place-items: center;
  }

  .sysnav__handle {
    width: 108px;
    height: 4px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.8;
  }

  .sysnav--buttons {
    height: 48px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0 40px;
  }

  .sysnav__button {
    justify-self: center;
    width: 56px;
    height: 40px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 20px;
    background: transparent;
    color: inherit;
    opacity: 0.8;
  }

  :host([data-framed]) {
    background: var(--md-sys-color-surface-container);
  }

  :host([data-framed]) .status,
  :host([data-framed]) .topbar {
    background: transparent;
  }

  .frame {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  .frame__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .frame__card {
    flex: 1;
    min-height: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--md-sys-color-surface);
    border-start-start-radius: 24px;
    overflow: hidden;
  }

  :host([data-framed]) .content {
    padding-bottom: var(--_system-nav);
  }

  :host([data-framed][data-bottom]) .content {
    padding-bottom: 0;
  }

  :host([data-framed][data-bottom]) .bottom {
    padding-bottom: var(--_system-nav);
  }

  :host([data-framed]) .sysnav {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    z-index: 4;
  }

  .rail {
    width: 96px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding-bottom: calc(8px + var(--_system-nav));
    overflow: hidden;
    transition: width 0.25s cubic-bezier(0.2, 0, 0, 1);
  }

  .rail--expanded {
    width: 280px;
  }

  .rail__header {
    height: 64px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-inline-start: 24px;
    --md-icon-button-icon-color: var(--md-sys-color-on-surface-variant);
  }

  .rail__title {
    font: 400 22px/28px var(--_font);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-inline-end: 16px;
  }

  .rail__items {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .rail__footer {
    margin-top: auto;
  }

  .rail__divider {
    align-self: stretch;
    height: 1px;
    margin: 8px 28px;
    background: var(--md-sys-color-outline-variant);
  }

  .rail__item {
    all: unset;
    box-sizing: border-box;
    width: 96px;
    min-height: 64px;
    padding: 6px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
  }

  .rail__indicator {
    width: 56px;
    height: 32px;
    border-radius: 16px;
    display: grid;
    place-items: center;
  }

  .rail__item[aria-current='page'] {
    color: var(--md-sys-color-secondary);
  }

  .rail__item[aria-current='page'] .rail__indicator {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  .rail__label {
    font: 500 12px/16px var(--_font);
    letter-spacing: 0.5px;
    max-width: 88px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rail--expanded .rail__items {
    align-items: stretch;
    padding-inline: 12px;
    gap: 0;
  }

  .rail--expanded .rail__item {
    width: auto;
    min-height: 56px;
    padding: 0 24px 0 16px;
    flex-direction: row;
    gap: 12px;
    border-radius: 28px;
  }

  .rail--expanded .rail__indicator {
    width: auto;
    height: auto;
    background: none !important;
  }

  .rail--expanded .rail__item[aria-current='page'] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  .rail--expanded .rail__label {
    max-width: none;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.1px;
  }

  .drawer {
    display: flex;
    flex-direction: column;
    padding-bottom: calc(12px + var(--_system-nav));
  }

  .drawer--permanent {
    width: 300px;
    flex-shrink: 0;
  }

  .drawer__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    margin-top: 4px;
    font: 400 22px/28px var(--_font);
  }

  .drawer__header img {
    width: 28px;
    height: 28px;
  }

  .drawer__items {
    display: flex;
    flex-direction: column;
    padding-inline: 12px;
  }

  .drawer__footer {
    margin-top: auto;
  }

  .drawer__divider {
    height: 1px;
    margin: 8px 16px;
    background: var(--md-sys-color-outline-variant);
  }

  .drawer__item {
    all: unset;
    box-sizing: border-box;
    height: 56px;
    border-radius: 28px;
    padding: 0 24px 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font: 500 14px/20px var(--_font);
    letter-spacing: 0.1px;
    color: var(--md-sys-color-on-surface-variant);
  }

  .drawer__item[aria-current='page'] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  .rail__item:focus-visible,
  .drawer__item:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary);
    outline-offset: -2px;
  }

  .badge {
    margin-inline-start: auto;
    font: 500 12px/16px var(--_font);
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
  }

  .scrim {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
  }

  .modal-drawer {
    position: relative;
    z-index: 1;
    width: min(360px, 100% - 56px);
    height: 100%;
    padding-top: var(--_status-bar, 0px);
    background: var(--md-sys-color-surface-container-low);
    border-radius: 0 16px 16px 0;
    overflow: hidden;
  }

  .modal-rail {
    position: relative;
    z-index: 1;
    height: 100%;
    padding-top: var(--_status-bar, 0px);
    background: var(--md-sys-color-surface-container-low);
    border-radius: 0 16px 16px 0;
  }

  .overlay--sheet {
    flex-direction: column;
    justify-content: flex-end;
  }

  .sheet {
    position: relative;
    z-index: 1;
    max-height: 92%;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 16px 16px calc(16px + var(--_system-nav));
    background: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    border-radius: 28px 28px 0 0;
  }

  .sheet.flush {
    padding: 0 0 var(--_system-nav);
  }

  .sheet__handle {
    width: 32px;
    height: 4px;
    margin: 6px auto 22px;
    border-radius: 2px;
    background: var(--md-sys-color-on-surface-variant);
    opacity: 0.4;
  }

  .sheet.flush .sheet__handle {
    margin-top: 22px;
  }

  .overlay--dialog {
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .dialog {
    position: relative;
    z-index: 1;
    width: min(560px, 100%);
    min-width: min(280px, 100%);
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 24px;
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    border-radius: 28px;
  }

  .dialog.flush {
    padding: 0;
  }

  .fullscreen {
    position: relative;
    z-index: 1;
    flex: 1;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    overflow: hidden;
  }

  .sheet:focus,
  .dialog:focus,
  .fullscreen:focus,
  .modal-drawer:focus,
  .modal-rail:focus,
  .menu:focus {
    outline: none;
  }

  .menu-layer {
    position: absolute;
    inset: 0;
    z-index: 30;
  }

  .menu {
    position: absolute;
    top: calc(var(--_status-bar, 0px) + 56px);
    inset-inline-end: 8px;
    min-width: 200px;
    padding: 8px 0;
    border-radius: 20px;
    background: var(--md-sys-color-surface-container);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .menu__item {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font: 400 14px/20px var(--_font);
    color: var(--md-sys-color-on-surface);
    --md-icon-size: 24px;
  }

  .menu__item:focus-visible {
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  :host([interactive]) .scrim {
    animation: fade-in 250ms linear both;
  }

  :host([interactive]) .sheet {
    animation: sheet-in 400ms cubic-bezier(0.05, 0.7, 0.1, 1) both;
  }

  :host([interactive]) .modal-drawer,
  :host([interactive]) .modal-rail {
    animation: drawer-in 250ms cubic-bezier(0.1, 0.9, 0.2, 1) both;
  }

  :host([interactive]) .fullscreen {
    animation: fade-in 200ms linear both;
  }

  :host([interactive]) .dialog {
    animation: dialog-in 250ms cubic-bezier(0.05, 0.7, 0.1, 1) both;
  }

  @keyframes dialog-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
  }
  :host([interactive][data-rail-opening]) .rail--expanded .rail__title,
  :host([interactive][data-rail-opening]) .rail--expanded .rail__label {
    animation: rail-label-in 300ms linear both;
  }

  :host([interactive]) .title__text {
    animation: fade-in 200ms linear both;
  }

  @keyframes rail-label-in {
    0%,
    50% {
      opacity: 0;
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
  @keyframes sheet-in {
    from {
      transform: translateY(100%);
    }
  }
  @keyframes drawer-in {
    from {
      transform: translateX(-100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :host([interactive]) .scrim,
    :host([interactive]) .sheet,
    :host([interactive]) .modal-drawer,
    :host([interactive]) .modal-rail,
    :host([interactive]) .fullscreen,
    :host([interactive]) .dialog,
    :host([interactive]) .rail--expanded .rail__title,
    :host([interactive]) .rail--expanded .rail__label,
    :host([interactive]) .title__text {
      animation: none;
    }
    .rail {
      transition: none;
    }
  }
`;
