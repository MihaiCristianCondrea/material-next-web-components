/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Wires the live demos of a page: every [data-demo="<id>"] element runs the
// module of the same name (src/docs/demos/<id>.ts), whose source is also the
// code sample shown under it. A module may return a cleanup function, called
// before the next page replaces the demo.
import appShowcase from './app-showcase.js';
import codeBlock from './code-block.js';
import deviceFrame from './device-frame.js';
import docsNavigation from './docs-navigation.js';
import embed from './embed.js';
import expressiveTabBar from './expressive-tab-bar.js';
import previewControls from './preview-controls.js';
import screenCard from './screen-card.js';
import screenHost from './screen-host.js';
import screenInspector from './screen-inspector.js';

type Demo = (root: HTMLElement) => void | (() => void);

const demos: Record<string, Demo> = {
  'app-showcase': appShowcase,
  'code-block': codeBlock,
  'device-frame': deviceFrame,
  'docs-navigation': docsNavigation,
  embed,
  'expressive-tab-bar': expressiveTabBar,
  'preview-controls': previewControls,
  'screen-card': screenCard,
  'screen-host': screenHost,
  'screen-inspector': screenInspector,
};

export const DEMO_IDS = Object.keys(demos);

export const runDemos = (root: ParentNode) => {
  const cleanups: Array<() => void> = [];
  for (const el of root.querySelectorAll<HTMLElement>('[data-demo]')) {
    const demo = demos[el.dataset.demo!];
    if (!demo) continue;
    try {
      const cleanup = demo(el);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    } catch (error) {
      console.error(`Demo "${el.dataset.demo}" failed`, error);
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
};
