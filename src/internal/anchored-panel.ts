/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * A panel that opens under a top app bar button: shown in the top layer (so a
 * sticky, blurred app bar does not clip it), placed under the button's end
 * edge and kept inside the window, and closed by Escape or a click outside,
 * with focus returned to the button. Internal: not a package export.
 *
 * The host renders the button and a `popover="manual"` surface, binds
 * `onKeyDown` to the surface, and owns the open state.
 */
export class AnchoredPanelController implements ReactiveController {
  private wasOpen = false;
  private restoreFocus = false;

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly options: {
      isOpen(): boolean;
      setOpen(open: boolean): void;
      trigger(): HTMLElement | null | undefined;
      surface(): HTMLElement | null | undefined;
      /** What takes focus when the panel opens. */
      focus?(): HTMLElement | null | undefined;
    }
  ) {
    host.addController(this);
  }

  hostUpdate() {
    if (this.wasOpen && !this.options.isOpen()) {
      // Before render makes the panel inert, which drops focus to the body.
      const root = this.host.shadowRoot;
      const active = root?.activeElement;
      this.restoreFocus ||=
        !!active && !!this.options.surface()?.contains(active);
    }
  }

  hostUpdated() {
    const open = this.options.isOpen();
    if (open === this.wasOpen) return;
    this.wasOpen = open;
    const surface = this.options.surface();
    if (!surface) return;
    const native = typeof surface.showPopover === 'function';
    if (open) {
      if (native && !surface.matches(':popover-open')) surface.showPopover();
      this.place();
      this.listen();
      this.options.focus?.()?.focus();
    } else {
      if (native && surface.matches(':popover-open')) surface.hidePopover();
      this.stopListening();
      if (this.restoreFocus) this.options.trigger()?.focus();
    }
    this.restoreFocus = false;
  }

  hostDisconnected() {
    this.stopListening();
    this.wasOpen = false;
  }

  /** Bind to the surface's `keydown`. */
  readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !this.options.isOpen()) return;
    e.stopPropagation();
    this.restoreFocus = true;
    this.options.setOpen(false);
  };

  /** Under the button, aligned to its end, moved in to stay in the window. */
  readonly place = () => {
    const rect = this.options.trigger()?.getBoundingClientRect();
    const surface = this.options.surface();
    if (!rect || !surface) return;
    const end = Math.max(
      8,
      Math.min(
        window.innerWidth - rect.right,
        window.innerWidth - surface.offsetWidth - 8
      )
    );
    surface.style.setProperty('--_top', `${Math.round(rect.bottom + 8)}px`);
    surface.style.setProperty('--_end', `${Math.round(end)}px`);
  };

  // Outside the panel and its button, not outside the host: the host can be
  // a whole page shell.
  private readonly onDocumentPointerDown = (e: PointerEvent) => {
    const path = e.composedPath();
    const surface = this.options.surface();
    const trigger = this.options.trigger();
    if (surface && path.includes(surface)) return;
    if (trigger && path.includes(trigger)) return;
    this.options.setOpen(false);
  };

  private listen() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    window.addEventListener('resize', this.place);
    window.addEventListener('scroll', this.place, {passive: true});
  }

  private stopListening() {
    document.removeEventListener(
      'pointerdown',
      this.onDocumentPointerDown,
      true
    );
    window.removeEventListener('resize', this.place);
    window.removeEventListener('scroll', this.place);
  }
}
