import {css} from 'lit';

export const wsSwitchStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    line-height: 0;
    --_track-width: var(--ws-switch-track-width, 52px);
    --_track-height: var(--ws-switch-track-height, 32px);
    --_handle-size: var(--ws-switch-handle-size, 24px);
  }

  :host([hidden]) {
    display: none;
  }

  .switch {
    border: 0;
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: var(--ws-switch-hit-area-padding, 4px);
    font: inherit;
    line-height: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) .switch {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .switch:focus-visible {
    outline: var(--ws-focus-ring-inner-size, 2px) solid
      var(--ws-color-primary, #6c5cff);
    outline-offset: var(--ws-spacing-xs, 4px);
    border-radius: 999px;
  }

  .track {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: var(--_track-width);
    height: var(--_track-height);
    border: 2px solid var(--ws-color-outline, #e2e8f0);
    border-radius: 999px;
    background: var(--ws-color-surface-variant, #f1f5f9);
    transition: background-color var(--ws-motion-duration-medium, 220ms)
        var(--ws-motion-easing-standard, ease),
      border-color var(--ws-motion-duration-medium, 220ms)
        var(--ws-motion-easing-standard, ease);
  }

  .handle {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 2px;
    width: var(--_handle-size);
    height: var(--_handle-size);
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--ws-color-primary, #6c5cff);
    background: var(--ws-color-surface, #ffffff);
    box-shadow: 0 2px 6px rgb(15 23 42 / 24%);
    transform: translateY(-50%);
    transition: transform var(--ws-motion-duration-medium, 260ms)
        cubic-bezier(0.2, 0, 0, 1),
      color var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease),
      box-shadow var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease);
  }

  :host([checked]) .track {
    border-color: var(--ws-color-primary, #6c5cff);
    background: var(--ws-color-primary-container, #f5f3ff);
  }

  :host([checked]) .handle {
    transform: translate(
      calc(var(--_track-width) - var(--_handle-size) - 8px),
      -50%
    );
  }

  .checked-icon,
  .unchecked-icon {
    grid-area: 1 / 1;
    display: inline-grid;
    place-items: center;
    font-size: var(--ws-switch-icon-size, 16px);
    line-height: 1;
    opacity: 1;
    transform: rotate(0deg) scale(1);
    transition: opacity var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-medium, 220ms)
        cubic-bezier(0.2, 0, 0, 1);
  }

  :host(:not([checked])) .checked-icon,
  :host([checked]) .unchecked-icon {
    opacity: 0;
    pointer-events: none;
    transform: rotate(-90deg) scale(0.55);
  }

  :host([checked]) .checked-icon {
    transform: rotate(0deg) scale(1);
  }
`;
