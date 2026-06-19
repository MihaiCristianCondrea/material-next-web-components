import {css} from 'lit';

export const wsPageStyles = css`
  :host {
    display: block;
    width: min(
      100% - var(--ws-spacing-xxl, 32px),
      var(--ws-page-max-width, 1120px)
    );
    margin: 0 auto;
    padding: var(--ws-page-padding-vertical, var(--ws-spacing-xxl, 32px)) 0
      var(--ws-spacing-xl, 24px);
    font-family: var(
      --ws-font-family,
      'Google Sans Flex',
      system-ui,
      sans-serif
    );
  }

  @media (max-width: 820px) {
    :host {
      padding-top: var(--ws-spacing-xl, 24px);
    }
  }
`;
