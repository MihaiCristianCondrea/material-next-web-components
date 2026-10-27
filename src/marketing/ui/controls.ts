/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/web/chips/assist-chip.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/icon/icon.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/slider/slider.js';
import '@material/web/switch/switch.js';
import {html, nothing} from 'lit';
import type {ScreenControl, ScreenState} from '../domain/screen.js';

/**
 * Lit templates for hub controls, built only from Material Web components.
 * The host owns every selected state; the components report choices.
 */

type Labelled<T> = readonly [value: T, label: string, icon?: string];

/** Single choice in a segmented button set. */
export const segments = <T extends string>(
  items: ReadonlyArray<Labelled<T>>,
  current: T,
  onPick: (value: T) => void,
  label: string
) =>
  html`<md-outlined-segmented-button-set
    aria-label=${label}
    @segmented-button-set-selection=${(
      e: CustomEvent<{selected: boolean; index: number}>
    ) => {
      if (e.detail.selected) onPick(items[e.detail.index][0]);
    }}
  >
    ${items.map(
      ([value, text, icon]) =>
        html`<md-outlined-segmented-button
          label=${text}
          .selected=${value === current}
          .hasIcon=${!!icon}
          >${icon ? html`<md-icon slot="icon">${icon}</md-icon>` : nothing}</md-outlined-segmented-button
        >`
    )}
  </md-outlined-segmented-button-set>`;

/**
 * Outlined select whose visible label sits above it, outside the field. Its
 * menu opens in the top layer, so a scrolling or animated panel around it
 * neither clips it nor scrolls to make room.
 */
export const select = <T extends string>(
  label: string,
  items: ReadonlyArray<Labelled<T>>,
  value: T,
  onPick: (value: T) => void
) =>
  html`<md-outlined-select
    aria-label=${label}
    .value=${String(value)}
    .menuPositioning=${'popover' as const}
    @change=${(e: Event) => onPick((e.target as HTMLSelectElement).value as T)}
  >
    ${items.map(
      ([key, text]) =>
        html`<md-select-option value=${String(key)} ?selected=${key === value}>
          <div slot="headline">${text}</div>
        </md-select-option>`
    )}
  </md-outlined-select>`;

/** Single choice as filter chips. */
export const chips = <T extends string | number>(
  items: ReadonlyArray<Labelled<T>>,
  current: T,
  onPick: (value: T) => void,
  label = ''
) =>
  html`<md-chip-set aria-label=${label || nothing}>
    ${items.map(
      ([value, text]) =>
        html`<md-filter-chip
          label=${text}
          .selected=${current === value}
          @click=${(e: Event) => {
            // The host owns selection: keep the chip in step with it.
            (e.currentTarget as HTMLElement & {selected: boolean}).selected =
              current === value;
            if (current !== value) onPick(value);
          }}
        ></md-filter-chip>`
    )}
  </md-chip-set>`;

const formatValue = (control: {unit?: string}, value: unknown) =>
  typeof value === 'number'
    ? `${Number.isInteger(value) ? value : value.toFixed(2)}${control.unit ?? ''}`
    : String(value);

const withExtra = (
  control: Extract<ScreenControl, {key: string}>,
  value: unknown
): ScreenState => ({
  [control.key]: value,
  ...(typeof control.patch === 'function'
    ? control.patch(value)
    : (control.patch ?? {})),
});

/** A screen's tweak panel from its `controls`. `apply(patch)` updates the screen. */
export const controlPanel = (
  controls: readonly ScreenControl[],
  state: ScreenState,
  apply: (patch: ScreenState) => void
) =>
  controls.map((c) => {
    if (c.type === 'presets') {
      return html`<div class="control">
        <div class="control__label">${c.label}</div>
        <md-chip-set>
          ${c.options.map(
            ([label, patch]) =>
              html`<md-assist-chip
                label=${label}
                @click=${() => apply(patch)}
              ></md-assist-chip>`
          )}
        </md-chip-set>
      </div>`;
    }
    if (c.type === 'choice') {
      return html`<div class="control">
        <div class="control__label">${c.label}</div>
        ${chips(
          c.options.map((o) => [o, String(o)] as const),
          state[c.key] as string | number,
          (o) => apply(withExtra(c, o)),
          c.label
        )}
      </div>`;
    }
    if (c.type === 'toggle') {
      return html`<label class="control control--row">
        <md-switch
          .selected=${!!state[c.key]}
          @change=${(e: Event) => apply(withExtra(c, (e.target as HTMLElement & {selected: boolean}).selected))}
        ></md-switch>
        <span>${c.label}</span>
      </label>`;
    }
    return html`<div class="control">
      <div class="control__row">
        <span class="control__label">${c.label}</span>
        <span class="control__value">${formatValue(c, state[c.key])}</span>
      </div>
      <md-slider
        aria-label=${c.label}
        min=${c.min}
        max=${c.max}
        step=${c.step ?? 1}
        .value=${Number(state[c.key] ?? c.min)}
        @input=${(e: Event) => apply(withExtra(c, Number((e.target as HTMLInputElement).value)))}
      ></md-slider>
    </div>`;
  });
