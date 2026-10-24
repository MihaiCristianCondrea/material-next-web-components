/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  DEFAULT_PROTOTYPE_VIEW,
  createScreenRegistry,
} from '../../marketing/index.js';
import type {
  MaterialNextScreenInspector,
  PrototypeView,
  ScreenState,
} from '../../marketing/index.js';
import {SCREENS} from '../sample-app/screens.js';

const registry = createScreenRegistry(SCREENS);

export default (root: HTMLElement) => {
  const inspector = root.querySelector<MaterialNextScreenInspector>(
    'mnw-screen-inspector'
  )!;
  const log = root.querySelector('.demo-log')!;
  let screen = registry.screens[0];
  let state: ScreenState = {...screen.defaults};
  inspector.screens = registry.screens;
  inspector.palettes = ['ocean', 'clay'];
  inspector.screen = screen;
  inspector.state = state;
  inspector.view = {...DEFAULT_PROTOTYPE_VIEW, id: screen.id};

  // The inspector only reports; the page applies each change and passes it back.
  inspector.addEventListener('view-change', (event) => {
    const patch = (event as CustomEvent<Partial<PrototypeView>>).detail;
    inspector.view = {...inspector.view, ...patch};
    log.textContent = `view-change ${JSON.stringify(patch)}`;
  });
  inspector.addEventListener('screen-select', (event) => {
    screen = registry.byId((event as CustomEvent<{id: string}>).detail.id)!;
    state = {...screen.defaults};
    Object.assign(inspector, {
      screen,
      state,
      view: {...inspector.view, id: screen.id},
    });
    log.textContent = `screen-select ${screen.id}`;
  });
  inspector.addEventListener('state-patch', (event) => {
    const {patch} = (event as CustomEvent<{patch: ScreenState}>).detail;
    state = {...state, ...patch};
    inspector.state = state;
    log.textContent = `state-patch ${JSON.stringify(patch)}`;
  });
  inspector.addEventListener('state-reset', () => {
    state = {...screen.defaults};
    inspector.state = state;
    log.textContent = 'state-reset';
  });
};
