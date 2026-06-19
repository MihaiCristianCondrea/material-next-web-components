import {css} from 'lit';

export const wsButtonStyles = css`
  :host {
    font-family: var(
      --ws-font-family,
      'Google Sans Flex',
      system-ui,
      sans-serif
    );
    font-optical-sizing: auto;
    font-variation-settings: 'slnt' 0, 'wdth' 100, 'GRAD' 0, 'ROND' 0;
    display: inline-flex;
    vertical-align: middle;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  .button {
    align-items: center;
    border: 1px solid transparent;
    border-radius: var(--ws-button-radius, var(--ws-shape-medium, 8px));
    box-sizing: border-box;
    cursor: pointer;
    display: inline-flex;
    font: var(--ws-button-font, var(--ws-typography-label-large));
    gap: var(--ws-button-icon-spacing, var(--ws-spacing-sm, 8px));
    justify-content: center;
    min-inline-size: var(--ws-button-min-width, 64px);
    outline: none;
    position: relative;
    text-decoration: none;
    transform: translateY(0) scale(1);
    transition: background-color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      border-color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      box-shadow var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      opacity var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-emphasized, ease);
    user-select: none;
    width: 100%;
  }

  .button:focus-visible {
    box-shadow: 0 0 0 var(--ws-focus-ring-inner-size, 2px)
        var(--ws-color-background, #f8fafc),
      0 0 0 var(--ws-focus-ring-outer-size, 5px)
        color-mix(
          in srgb,
          var(--ws-button-focus-color, var(--ws-color-primary, #6c5cff)) 45%,
          transparent
        );
  }

  .button:not(:disabled):active {
    transform: translateY(var(--ws-button-pressed-offset, 1px))
      scale(var(--ws-button-pressed-scale, 0.98));
  }

  :host([variant='primary']) .button,
  :host(:not([variant])) .button {
    --ws-button-focus-color: var(--ws-color-primary, #6c5cff);
    background: var(--ws-color-primary, #6c5cff);
    box-shadow: var(--ws-elevation-sm, 0 1px 2px rgb(15 23 42 / 8%));
    color: var(--ws-color-on-primary, #f8fafc);
  }

  :host([variant='primary']) .button:not(:disabled):hover,
  :host(:not([variant])) .button:not(:disabled):hover {
    background: var(--ws-purple-dark, #4f46e5);
    box-shadow: var(--ws-elevation-md, 0 8px 24px rgb(15 23 42 / 12%));
  }

  :host([variant='secondary']) .button {
    --ws-button-focus-color: var(--ws-color-secondary, #3b82f6);
    background: var(--ws-color-secondary-container, #f1f5f9);
    border-color: var(--ws-color-outline-variant, #e2e8f0);
    color: var(--ws-color-on-secondary-container, #0f172a);
  }

  :host([variant='secondary']) .button:not(:disabled):hover {
    background: color-mix(
      in srgb,
      var(--ws-color-secondary, #3b82f6) 14%,
      var(--ws-color-secondary-container, #f1f5f9)
    );
    border-color: color-mix(
      in srgb,
      var(--ws-color-secondary, #3b82f6) 26%,
      var(--ws-color-outline-variant, #e2e8f0)
    );
  }

  :host([variant='outlined']) .button {
    --ws-button-focus-color: var(--ws-color-primary, #6c5cff);
    background: transparent;
    border-color: var(--ws-color-outline, #e2e8f0);
    color: var(--ws-color-primary, #6c5cff);
  }

  :host([variant='outlined']) .button:not(:disabled):hover {
    background: var(--ws-color-primary-container, #f5f3ff);
    border-color: var(--ws-color-primary, #6c5cff);
  }

  :host([variant='ghost']) .button {
    --ws-button-focus-color: var(--ws-color-primary, #6c5cff);
    background: transparent;
    color: var(--ws-color-primary, #6c5cff);
  }

  :host([variant='ghost']) .button:not(:disabled):hover {
    background: var(--ws-color-primary-container, #f5f3ff);
  }

  :host([size='small']) .button {
    --ws-button-icon-size: var(--ws-button-small-icon-size, 16px);
    --ws-button-icon-spacing: var(
      --ws-button-small-icon-spacing,
      var(--ws-spacing-xs, 4px)
    );
    block-size: var(--ws-button-small-height, 36px);
    font: var(--ws-typography-label-small);
    padding: 0 var(--ws-button-small-padding-inline, var(--ws-spacing-md, 12px));
  }

  :host([size='medium']) .button,
  :host(:not([size])) .button {
    --ws-button-icon-size: var(--ws-button-medium-icon-size, 18px);
    --ws-button-icon-spacing: var(--ws-spacing-sm, 8px);
    block-size: var(--ws-button-medium-height, 44px);
    font: var(--ws-typography-label-medium);
    padding: 0
      var(--ws-button-medium-padding-inline, var(--ws-spacing-lg, 16px));
  }

  :host([size='large']) .button {
    --ws-button-icon-size: var(--ws-button-large-icon-size, 20px);
    --ws-button-icon-spacing: var(
      --ws-button-large-icon-spacing,
      var(--ws-spacing-md, 12px)
    );
    block-size: var(--ws-button-large-height, 52px);
    font: var(--ws-typography-label-large);
    padding: 0 var(--ws-spacing-xl, 24px);
  }

  :host([icon-only]) .button {
    padding-inline: 0;
  }

  :host([icon-only][size='small']) .button {
    min-inline-size: var(--ws-button-small-height, 36px);
  }

  :host([icon-only][size='medium']) .button,
  :host([icon-only]:not([size])) .button {
    min-inline-size: var(--ws-button-medium-height, 44px);
  }

  :host([icon-only][size='large']) .button {
    min-inline-size: var(--ws-button-large-height, 52px);
  }

  .button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .icon,
  .spinner {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
  }

  .icon ::slotted(*) {
    align-items: center;
    block-size: var(--ws-button-icon-size, 18px);
    display: inline-flex;
    flex: 0 0 var(--ws-button-icon-size, 18px);
    font-size: var(--ws-button-icon-size, 18px);
    inline-size: var(--ws-button-icon-size, 18px);
    justify-content: center;
    line-height: 1;
    min-inline-size: var(--ws-button-icon-size, 18px);
  }

  .icon ::slotted(svg) {
    block-size: var(--ws-button-icon-size, 18px);
    inline-size: var(--ws-button-icon-size, 18px);
  }

  :host([loading]) .icon {
    display: none;
  }

  .spinner {
    block-size: var(--ws-button-spinner-size, 18px);
    border: var(--ws-button-spinner-stroke-size, 2px) solid currentcolor;
    border-block-start-color: transparent;
    border-radius: var(--ws-shape-full, 999px);
    box-sizing: border-box;
    inline-size: var(--ws-button-spinner-size, 18px);
    animation: ws-button-spin var(--ws-motion-duration-extra-slow, 800ms) linear
      infinite;
  }

  @keyframes ws-button-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
