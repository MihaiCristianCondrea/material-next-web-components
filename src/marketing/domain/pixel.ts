/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * The Pixel 9 Pro XL that <mnw-device-frame> draws, as plain data: its outside in millimetres and
 * its finishes. The three.js model (`marketing/ui/pixel-model.js`) is built from these numbers.
 */

/**
 * The Pixel 9 Pro XL's outside, in millimetres, from Google's published specifications and product
 * photos. Built from these numbers alone: no third-party model or mesh is used.
 */
export const PIXEL_9_PRO_XL = {
  width: 76.6,
  height: 162.8,
  depth: 8.5,
  /** The rounded corners seen from the front, fitted to Google's product photos. */
  cornerRadius: 12.2,
  /** The soft edge where the flat frame meets the glass. */
  edgeRadius: 0.8,
  /** The lit panel: 6.8 inches across, 1344 by 2992 pixels. */
  display: {width: 70.8, height: 157.6, cornerRadius: 8.2},
  /** The hole-punch camera, placed as in Google's Android Studio device art. */
  frontCamera: {fromTop: 7.7, diameter: 3.6, ring: 4.8},
  /** The camera bar: a satin metal pill almost the phone's width, standing proud of the back. */
  visor: {width: 69.6, height: 21.2, fromTop: 13.8, raise: 3.66, edge: 0.2},
  /**
   * The cameras, seen from the back: centres across from the phone's centre line (positive to the
   * left) and up from the camera bar's centre line, sizes. The window is the black glass the lenses
   * sit under, `depth` below the bar's top; the flash and the temperature sensor sit on the metal to
   * its right.
   */
  cameras: {
    window: {left: 33.7, right: -19.4, inset: 1.15, depth: 0.9},
    ultrawide: {x: 24.6, barrel: 7.1, glass: 3.8},
    main: {x: 8.45, halo: 13.3, barrel: 9.8, glass: 6.4},
    telephoto: {x: -4.46, surround: [7.2, 9.8, 1.6], glass: [4.6, 6.2, 1.3]},
    spectral: {x: -13.4, up: 0.2, size: 1.0},
    microphone: {x: 17.8, up: 5.6, diameter: 0.7},
    autofocus: {x: [20.0, 15.8], up: -6.8, diameter: 2.8},
    flash: {x: -25.7, up: 4.3, diameter: 5.6, led: 1.2},
    sensor: {x: -25.7, up: -4.2, diameter: 5.6},
  },
  /** The keys on the right edge, from the top. */
  keys: {
    power: {fromTop: 40.4, length: 12.7},
    volume: {fromTop: 61.9, length: 23.9},
    proud: 0.5,
  },
} as const;

/**
 * The finishes the Pixel 9 Pro XL ships in: a polished frame, a satin camera bar and a matte glass
 * back, each in the colourway's own tone.
 */
export type PixelFinish = 'obsidian' | 'porcelain' | 'hazel' | 'rose-quartz';

/** The colours of each finish, as 0xRRGGBB: frame, camera bar top and side walls, back glass. */
export const PIXEL_FINISHES: Readonly<
  Record<PixelFinish, {frame: number; bar: number; side: number; back: number}>
> = {
  obsidian: {frame: 0x4a4c50, bar: 0x4e4e4f, side: 0x1c1d1f, back: 0x171719},
  porcelain: {frame: 0xd6cfc3, bar: 0xcfc8bb, side: 0x9c968c, back: 0xe9e4da},
  hazel: {frame: 0x7f8b80, bar: 0x929d91, side: 0x5c665d, back: 0x8e9a8e},
  'rose-quartz': {
    frame: 0xdcb3aa,
    bar: 0xdcb6ad,
    side: 0xa88a84,
    back: 0xefd0ca,
  },
};

/** Every finish, in Google's order. */
export const PIXEL_FINISH_NAMES = Object.keys(
  PIXEL_FINISHES
) as readonly PixelFinish[];
