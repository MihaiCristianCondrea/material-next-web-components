import {css} from 'lit';

export const wsBreadcrumbsStyles = css`
  :host {
    color: var(
      --ws-breadcrumbs-color,
      var(--ws-color-on-surface-variant, #64748b)
    );
    display: block;
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

  .breadcrumbs {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--ws-spacing-xs, 4px);
  }

  .crumb {
    border-radius: var(--ws-shape-extra-small, 4px);
    color: inherit;
    font: var(--ws-typography-body-medium);
    font-weight: 500;
    padding: var(--ws-spacing-xs, 4px) var(--ws-spacing-sm, 8px);
    text-decoration: none;
    transition: background-color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      color var(--ws-motion-duration-medium, 180ms)
        var(--ws-motion-easing-standard, ease),
      transform var(--ws-motion-duration-fast, 120ms)
        var(--ws-motion-easing-standard, ease);
  }

  a.crumb {
    cursor: pointer;
  }

  a.crumb:hover,
  a.crumb:focus-visible,
  a.crumb.active {
    background: var(--ws-color-primary-container, #f5f3ff);
    color: var(--ws-color-primary, #6c5cff);
  }

  a.crumb:focus-visible {
    outline: var(--ws-focus-ring-inner-size, 2px) solid
      var(--ws-color-primary, #6c5cff);
    outline-offset: 2px;
  }

  a.crumb:active {
    transform: scale(0.96);
  }

  .crumb[aria-current='page'] {
    color: var(--ws-color-on-surface, #0f172a);
    font-weight: 600;
  }

  .separator {
    block-size: 16px;
    color: color-mix(in srgb, currentColor 50%, transparent);
    inline-size: 16px;
  }
`;
