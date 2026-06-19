import {css} from 'lit';

export const wsTabsStyles = css`
  :host {
    --ws-tabs-gap: var(--ws-spacing-xs, 4px);
    --ws-tabs-indicator-block-size: 3px;
    --ws-tabs-indicator-inline-size: 0px;
    --ws-tabs-indicator-opacity: 0;
    --ws-tabs-indicator-x: 0px;
    --ws-tabs-indicator-y: 0px;
    display: inline-flex;
    min-inline-size: 0;
  }

  :host([hidden]) {
    display: none;
  }

  .tabs {
    align-items: center;
    display: inline-flex;
    gap: var(--ws-tabs-gap);
    min-inline-size: 0;
    position: relative;
  }

  .indicator {
    background: var(--ws-color-primary, #6c5cff);
    block-size: var(--ws-tabs-indicator-block-size);
    border-radius: var(--ws-tab-indicator-radius, var(--ws-shape-full, 999px));
    inline-size: var(--ws-tabs-indicator-inline-size);
    inset-block-end: 0;
    inset-inline-start: 0;
    opacity: var(--ws-tabs-indicator-opacity);
    pointer-events: none;
    position: absolute;
    transform: translate(
      var(--ws-tabs-indicator-x),
      var(--ws-tabs-indicator-y)
    );
    transition: none;
    z-index: 1;
  }

  :host([indicator-animated]) .indicator {
    transition: inline-size var(--ws-motion-duration-slow, 240ms)
        var(--ws-motion-easing-standard, ease),
      block-size var(--ws-motion-duration-slow, 240ms)
        var(--ws-motion-easing-standard, ease),
      opacity var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-slow, 240ms)
        var(--ws-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
  }

  @media (prefers-reduced-motion: reduce) {
    :host([indicator-animated]) .indicator {
      transition-duration: 1ms;
      transition-timing-function: linear;
    }
  }

  :host([orientation='vertical']) {
    display: flex;
    inline-size: 100%;
  }

  :host([orientation='vertical']) .tabs {
    align-items: stretch;
    display: flex;
    flex-direction: column;
    inline-size: 100%;
  }

  :host([orientation='vertical']) .indicator {
    inset-block-end: auto;
    inset-block-start: 0;
  }
`;
