import {css} from 'lit';

export const wsAppBarStyles = css`
  :host {
    display: block;
    --ws-app-bar-min-height: 56px;
    --ws-app-bar-padding-block: var(--ws-spacing-sm, 8px);
    --ws-app-bar-padding-inline: var(--ws-spacing-lg, 16px);
    --ws-app-bar-gap: var(--ws-spacing-md, 12px);
    --ws-app-bar-background: color-mix(
      in srgb,
      var(--ws-color-surface, #ffffff) 86%,
      transparent
    );
    --ws-app-bar-border-color: var(--ws-color-outline-variant, #e2e8f0);
    --ws-app-bar-backdrop-filter: blur(18px);
    --ws-app-bar-z-index: 5;
  }

  :host([hidden]) {
    display: none;
  }

  .app-bar {
    min-height: var(--ws-app-bar-min-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ws-app-bar-gap);
    border-bottom: 1px solid var(--ws-app-bar-border-color);
    padding: var(--ws-app-bar-padding-block) var(--ws-app-bar-padding-inline);
    background: var(--ws-app-bar-background);
    backdrop-filter: var(--ws-app-bar-backdrop-filter);
  }

  :host([sticky]) {
    position: sticky;
    top: var(--ws-app-bar-sticky-offset, 0);
    z-index: var(--ws-app-bar-z-index);
  }

  .leading,
  .trailing {
    display: inline-flex;
    align-items: center;
    gap: var(--ws-app-bar-gap);
  }

  .content {
    min-width: 0;
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--ws-app-bar-gap);
  }

  .trailing {
    flex: 0 0 auto;
    justify-content: flex-end;
  }

  ::slotted(*) {
    min-width: 0;
  }
`;
