/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '../../code-block.js';

export default (root: HTMLElement) => {
  const log = root.querySelector('.demo-log')!;
  root.addEventListener('mnw-code-copy', (event) => {
    const {code} = (event as CustomEvent<{code: string}>).detail;
    log.textContent = `mnw-code-copy: ${code.length} characters on the clipboard`;
  });
  root.addEventListener('mnw-code-copy-error', () => {
    log.textContent = 'mnw-code-copy-error: the browser refused the clipboard';
  });
};
