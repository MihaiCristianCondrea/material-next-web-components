/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css} from 'lit';

/** Shared by every component and the page, so local palettes resolve locally. */
export const scrollbarStyles = css`
  @media (pointer: fine) {
    :host,
    * {
      scrollbar-color: var(
          --mnw-scrollbar-thumb,
          var(--md-sys-color-primary, #6750a4)
        )
        transparent;
      scrollbar-width: thin;
    }

    @supports not (scrollbar-color: red transparent) {
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: var(
          --mnw-scrollbar-thumb,
          var(--md-sys-color-primary, #6750a4)
        );
        border-radius: 4px;
      }
    }
  }

  @media (forced-colors: active) {
    :host,
    * {
      scrollbar-color: CanvasText transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: CanvasText;
    }
  }
`;

// Component imports also theme the document scrollbar. Adopting the same sheet
// in shadow roots covers drawers, code blocks and other internal scroll areas.
// Keep package imports usable during server rendering and build-time analysis.
if (typeof document !== 'undefined') {
  const sheet = scrollbarStyles.styleSheet;
  if (sheet && 'adoptedStyleSheets' in document) {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } else if (!document.querySelector('style[data-mnw-scrollbars]')) {
    const style = document.createElement('style');
    style.dataset.mnwScrollbars = '';
    style.textContent = scrollbarStyles.cssText;
    document.head.append(style);
  }
}
