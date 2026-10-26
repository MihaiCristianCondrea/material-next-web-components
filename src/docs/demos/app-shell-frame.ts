/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Resizes the demo console's frame, so the shell crosses its breakpoint.
export default (root: HTMLElement) => {
  const frame = root.querySelector<HTMLIFrameElement>('iframe')!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-width]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const width = button.dataset.width;
      frame.style.width = width ? `${width}px` : '';
      for (const other of buttons) {
        other.setAttribute('aria-pressed', String(other === button));
      }
    });
  }
};
