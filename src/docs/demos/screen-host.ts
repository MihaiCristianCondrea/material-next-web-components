/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/button/outlined-button.js';
import '@material/web/switch/switch.js';
import {ScreenHost, createScreenRegistry} from '../../marketing/index.js';
import {SCREENS} from '../sample-app/screens.js';

export default (root: HTMLElement) => {
  const log = root.querySelector('.demo-log')!;
  const show = (host: ScreenHost) => {
    log.textContent = `screen: ${host.screen?.id}\nstate: ${JSON.stringify(host.state)}`;
  };
  const host = new ScreenHost(
    root.querySelector<HTMLElement>('.host-demo__screen')!,
    {
      registry: createScreenRegistry(SCREENS),
      id: 'notes',
      palette: 'captured',
      // go() from inside the screen (a note, the Focus tab) lands here. This page
      // loads the target in the same host; the gallery opens the prototype page.
      onGo: (id, state, h) => {
        h.load(id, state);
        show(h);
      },
      onChange: show,
    }
  );
  show(host);

  const actions: Record<string, () => void> = {
    pinned: () => host.set({filter: 'pinned'}),
    all: () => host.set({filter: 'all'}),
    go: () => host.go('focus'),
    reset: () => host.reset(),
  };
  for (const button of root.querySelectorAll<HTMLElement>('[data-action]')) {
    button.addEventListener('click', () => {
      actions[button.dataset.action!]();
      show(host);
    });
  }
  for (const toggle of root.querySelectorAll<HTMLElement & {selected: boolean}>(
    '[data-option]'
  )) {
    toggle.addEventListener('change', () => {
      host.setOptions(
        toggle.dataset.option === 'dark'
          ? {theme: toggle.selected ? 'dark' : 'light'}
          : {frame: toggle.selected}
      );
    });
  }
  return () => host.destroy();
};
