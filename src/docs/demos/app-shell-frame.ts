/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Shows the demo console at a phone, tablet or desktop width, scaled down to
// fit the page, so the shell crosses its breakpoint as it would in a real
// window. Switches its drawer presentation in place: the console keeps its
// route, its unsaved text and its navigation nodes.
const HEIGHT = 760;

export default (root: HTMLElement) => {
  const frame = root.querySelector<HTMLIFrameElement>('iframe')!;
  const stage = root.querySelector<HTMLElement>('.app-shell-stage')!;
  let width = 1280;
  let presentation = 'auto';

  const fit = () => {
    const scale = Math.min(1, stage.clientWidth / width);
    frame.style.width = `${width}px`;
    frame.style.height = `${HEIGHT / scale}px`;
    // zoom, not transform: the console lays out at `width` and pointer
    // coordinates follow the scaled frame.
    frame.style.zoom = String(scale);
  };
  const observer = new ResizeObserver(fit);
  observer.observe(stage);

  const tell = () =>
    frame.contentWindow?.postMessage(
      {type: 'app-shell-presentation', mode: presentation},
      location.origin
    );
  // A reload inside the frame starts over; tell it again.
  frame.addEventListener('load', tell);

  const group = (attribute: string, apply: (value: string) => void) => {
    const buttons = [
      ...root.querySelectorAll<HTMLButtonElement>(`[${attribute}]`),
    ];
    for (const button of buttons) {
      button.addEventListener('click', () => {
        apply(button.getAttribute(attribute) ?? '');
        for (const other of buttons) {
          other.setAttribute('aria-pressed', String(other === button));
        }
      });
    }
  };
  group('data-width', (value) => {
    width = Number(value);
    fit();
  });
  group('data-presentation', (mode) => {
    presentation = mode;
    tell();
  });
  return () => observer.disconnect();
};
