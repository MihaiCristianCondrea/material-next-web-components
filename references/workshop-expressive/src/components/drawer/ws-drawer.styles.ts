import {css} from 'lit';

export const wsDrawerStyles = css`
  :host {
    font-family: var(--ws-font-family, 'Google Sans Flex', system-ui, sans-serif);
    display: block;
    inline-size: var(--ws-drawer-width, 280px);
    min-inline-size: 0;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  .drawer {
    background: var(
      --ws-drawer-container-color,
      var(--ws-color-surface, #ffffff)
    );
    block-size: var(--ws-drawer-height, 100%);
    border: 1px solid
      color-mix(in srgb, var(--ws-color-outline, #e2e8f0) 72%, transparent);
    border-radius: var(--ws-drawer-radius, var(--ws-shape-medium, 8px));
    box-shadow: var(--ws-drawer-elevation, var(--ws-elevation-none, none));
    box-sizing: border-box;
    color: var(--ws-color-on-surface, #0f172a);
    display: flex;
    flex-direction: column;
    gap: var(--ws-spacing-lg, 16px);
    min-block-size: 0;
    overflow: hidden;
    padding: var(--ws-drawer-padding, var(--ws-spacing-xl, 24px));
  }

  .content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--ws-drawer-item-gap, var(--ws-spacing-xs, 4px));
    min-block-size: 0;
    overflow: auto;
  }

  .header,
  .footer {
    flex: 0 0 auto;
  }

  .header slot,
  .footer slot {
    display: block;
  }
`;
