import {css} from 'lit';

export const wsBrandMarkStyles = css`
  :host {
    --ws-brand-mark-size: var(--ws-spacing-xxl, 32px);
    --ws-brand-mark-gradient: var(--ws-color-surface, #ffffff);
    color: var(--ws-color-on-surface, #0f172a);
    display: inline-block;
    font-family: var(
      --ws-font-family,
      'Google Sans Flex',
      system-ui,
      sans-serif
    );
    gap: var(--ws-spacing-md, 12px);
    min-inline-size: 0;
  }

  .root {
    align-items: center;
    display: inline-flex;
    gap: inherit;
    min-inline-size: 0;
  }

  :host([hidden]) {
    display: none;
  }

  .mark {
    align-items: center;
    background: var(--ws-brand-mark-gradient);
    block-size: var(--ws-brand-mark-size);
    border-radius: var(--ws-brand-mark-radius, var(--ws-shape-large, 12px));
    box-sizing: border-box;
    color: var(--ws-color-primary, #6c5cff);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: calc(var(--ws-brand-mark-size) * 0.42);
    font-weight: 900;
    inline-size: var(--ws-brand-mark-size);
    justify-content: center;
    letter-spacing: -0.04em;
    line-height: 1;
    overflow: hidden;
    padding: calc(var(--ws-brand-mark-size) * 0.08);
    user-select: none;
  }

  .logo {
    block-size: 100%;
    display: block;
    inline-size: 100%;
  }

  .dot {
    opacity: 1;
    transform: translateY(0) scale(1, 1);
    transform-box: view-box;
    transform-origin: 50px 38px;
  }

  .w-half {
    opacity: 1;
    stroke-dasharray: 85;
    stroke-dashoffset: 0;
    transform: scale(1);
    transform-box: view-box;
    transform-origin: 50px 55px;
  }

  .drop {
    opacity: 0;
    transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
    transform-box: view-box;
    transform-origin: 50px 45px;
  }

  :host([animating]) .dot {
    animation: dropSplash 3s 1 both;
  }

  :host([animating]) .w-half {
    animation: splashW 3s 1 both;
  }

  :host([animating]) .drop {
    animation: dropSplashFly 3s 1 both;
  }

  .drop-1 {
    --tx: -25px;
    --ty: -20px;
    --scale: 1;
  }

  .drop-2 {
    --tx: 30px;
    --ty: -15px;
    --scale: 1.2;
  }

  .drop-3 {
    --tx: -15px;
    --ty: -35px;
    --scale: 0.8;
  }

  .drop-4 {
    --tx: 20px;
    --ty: -30px;
    --scale: 1.1;
  }

  .drop-5 {
    --tx: -40px;
    --ty: -5px;
    --scale: 0.9;
  }

  .drop-6 {
    --tx: 40px;
    --ty: 0px;
    --scale: 1;
  }

  @keyframes dropSplash {
    0% {
      opacity: 0;
      transform: translateY(-80px) scale(1, 1);
      animation-timing-function: cubic-bezier(0.5, 0, 0.8, 1);
    }

    2% {
      opacity: 1;
    }

    12% {
      transform: translateY(14px) scale(0.8, 1.2);
      animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    15% {
      transform: translateY(17px) scale(1.6, 0.4);
      animation-timing-function: cubic-bezier(0.2, 0.8, 0.4, 1);
    }

    22% {
      transform: translateY(-8px) scale(0.9, 1.1);
      animation-timing-function: ease-in-out;
    }

    28% {
      transform: translateY(0) scale(1, 1);
    }

    75% {
      opacity: 1;
      transform: translateY(0) scale(1, 1);
      animation-timing-function: cubic-bezier(0.5, 0, 0.8, 1);
    }

    85% {
      opacity: 0;
      transform: translateY(0) scale(0, 0);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1, 1);
    }
  }

  @keyframes splashW {
    0%,
    12% {
      opacity: 0;
      stroke-dashoffset: 85;
      transform: scale(0.8);
    }

    13% {
      opacity: 1;
      animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    22% {
      stroke-dashoffset: 0;
      transform: scale(1.05);
      animation-timing-function: ease-in-out;
    }

    28% {
      opacity: 1;
      stroke-dashoffset: 0;
      transform: scale(1);
    }

    75% {
      opacity: 1;
      stroke-dashoffset: 0;
      transform: scale(1);
      animation-timing-function: cubic-bezier(0.4, 0, 0.8, 1);
    }

    85% {
      opacity: 0;
      stroke-dashoffset: -85;
      transform: scale(1);
    }

    100% {
      opacity: 1;
      stroke-dashoffset: 0;
      transform: scale(1);
    }
  }

  @keyframes dropSplashFly {
    0%,
    12% {
      opacity: 0;
      transform: translate(0, 0) scale(0);
    }

    13% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
      animation-timing-function: cubic-bezier(0.1, 0.9, 0.2, 1);
    }

    28%,
    100% {
      opacity: 0;
      transform: translate(var(--tx), var(--ty)) scale(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host([animating]) .dot,
    :host([animating]) .w-half,
    :host([animating]) .drop {
      animation-duration: 1ms;
      animation-iteration-count: 1;
    }
  }

  .text {
    display: grid;
    gap: calc(var(--ws-spacing-xs, 4px) / 2);
    min-inline-size: 0;
  }

  .title,
  .subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title {
    color: var(--ws-color-on-surface, #0f172a);
    font: var(--ws-typography-title-medium);
  }

  .subtitle {
    color: var(--ws-color-on-surface-variant, #64748b);
    font: var(--ws-typography-label-medium);
  }
`;
