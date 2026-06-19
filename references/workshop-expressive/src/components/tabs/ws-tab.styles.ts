import {css} from 'lit';

export const wsTabStyles = css`
  :host {
    color: var(--ws-color-on-surface-variant, #64748b);
    display: inline-flex;
    font-family: var(
      --ws-font-family,
      'Google Sans Flex',
      system-ui,
      sans-serif
    );
  }

  :host([hidden]) {
    display: none;
  }

  .tab {
    align-items: center;
    border-radius: var(--ws-tab-radius, var(--ws-shape-medium, 8px));
    box-sizing: border-box;
    color: inherit;
    display: inline-flex;
    gap: var(--ws-spacing-sm, 8px);
    font: var(--ws-typography-label-medium);
    min-block-size: var(--ws-tab-height, 48px);
    padding: 0 var(--ws-spacing-lg, 16px);
    position: relative;
    text-align: center;
    inline-size: 100%;
    text-decoration: none;
    outline: none;
    transition: background-color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease);
  }

  .tab:focus-visible {
    box-shadow: 0 0 0 var(--ws-focus-ring-inner-size, 2px)
        var(--ws-color-surface, #ffffff),
      0 0 0 var(--ws-focus-ring-outer-size, 4px)
        var(--ws-color-primary, #6c5cff);
  }

  .tab:hover {
    background: var(--ws-color-primary-container, #f5f3ff);
    color: var(--ws-color-primary, #6c5cff);
  }

  .tab:active {
    transform: scale(0.98);
  }

  :host([selected]) {
    color: var(--ws-color-primary, #6c5cff);
  }

  :host([selected]) .tab {
    background: color-mix(
      in srgb,
      var(--ws-color-primary, #6c5cff) 12%,
      transparent
    );
  }

  .icon,
  ::slotted([slot='icon']) {
    align-items: center;
    display: inline-flex;
    font-size: 1em;
    justify-content: center;
    line-height: 1;
  }
  :host-context(ws-tabs[orientation='vertical']) {
    display: flex;
    inline-size: 100%;
  }

  :host-context(ws-tabs[orientation='vertical']) .tab {
    justify-content: flex-start;
    min-block-size: var(--ws-tab-vertical-height, 44px);
    text-align: start;
  }
`;
