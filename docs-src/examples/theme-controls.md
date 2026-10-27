---
tags: reference
name: Theme controls
description: A palette button and theme controls that generate Material 3 color roles from one source color, with a reusable HCT color picker and a saved preference.
category: components
icon: palette
status: experimental
tagName:
  [mnw-theme-button, mnw-theme-controls, mnw-color-picker, mnw-hct-slider]
importPath: material-next-web-components/theme.js
order: 55
---

## Overview

The palette button in this site's top app bar is `<mnw-theme-button>`. It opens theme controls like those on [material-web.dev](https://material-web.dev/): pick a source color with the swatch or the hue, chroma and tone sliders, and choose dark, system or light. The page's color roles are generated from that color with [Material Color Utilities](https://github.com/material-foundation/material-color-utilities), the library behind Android's dynamic color, and the choice is saved for the next visit.

Four elements, from the whole to its parts:

- `<mnw-theme-button>`: a top app bar button that opens `<mnw-theme-controls>` in a panel, themes the document and remembers the choice.
- `<mnw-theme-controls>`: the source color, the color mode and a reset to the page's own colors. Controlled by default; it can persist and apply on its own.
- `<mnw-color-picker>`: the reusable color picker, a hex swatch and three HCT sliders. Use it anywhere a color is chosen, for example an app's seed color.
- `<mnw-hct-slider>`: one hue, chroma or tone slider over the gradient it reaches.

## Live demo

{% demo "theme-controls" "Controlled theme controls that draw the roles they generate, without theming this page, and a color picker on its own. The palette button in the top app bar themes the whole site." "column" %}

## Usage

One element in the app bar themes the page and remembers the choice:

```html
<script type="module">
  import 'material-next-web-components/theme.js';
</script>

<mnw-theme-button storage-key="my-app:theme"></mnw-theme-button>
```

Every page on the origin with the same `storage-key` shares the theme. `default-color` is the seed shown until a color is chosen; set it to your page's own seed.

### Applying a theme

`applyColorTheme({sourceColor, mode})` writes the roles as `--md-sys-color-*` custom properties in one `<style>` at the end of `<head>` and sets `data-color-mode` (`light`, `dark` or `system`) on the root element. Without `sourceColor` the style is removed and the page's own colors show. Pages with their own dark tokens can follow the mode with:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-color-mode='light']) {
    /* dark tokens */
  }
}
:root[data-color-mode='dark'] {
  /* dark tokens */
}
```

The generated style uses `:root[data-color-mode]`, as specific as those rules and later in the document, so a chosen color wins over the page's tokens in both modes.

### Controlled controls

Without `storage-key`, `store` or `apply`, `<mnw-theme-controls>` only reports. Apply each `color-theme-change` yourself:

```ts
import {applyColorTheme} from 'material-next-web-components/theme.js';

controls.addEventListener('color-theme-change', (event) => {
  applyColorTheme(event.detail); // {sourceColor?, mode}
});
```

The `preference` getter returns the current choice, and `reset()` returns to the page's own colors, keeping the mode.

### The color picker on its own

```html
<mnw-color-picker value="#006a6a" swatch-label="Seed color"></mnw-color-picker>
```

`value` is `#rrggbb`. It fires `input` while the color changes and `change` when a slider is let go or the system dialog closes. The sliders keep their own HCT values, so dragging chroma to 0 keeps the chosen hue. Chroma beyond what sRGB can show is clipped in `value`.

### Color schemes without the elements

The domain functions are pure, for build scripts, server rendering and tests:

```ts
import {
  colorScheme,
  colorThemeCss,
} from 'material-next-web-components/theme.js';

colorScheme('#006a6a', {dark: true, variant: 'content'}).primary; // '#…'
colorThemeCss({sourceColor: '#006a6a', mode: 'system'}); // CSS for :root
```

`variant` is `tonal-spot` (Android's default), `content` (keeps the source color as primary) or `vibrant`. `contrast` runs from -1 to 1.

### Storage

`createThemePreferenceStore({key})` keeps `{"version": 1, "sourceColor": "#…", "mode": "dark"}` under `key` (default `mnw-theme`). Invalid fields are dropped by `normalizeThemePreference()`, and storage that is full, blocked or corrupt falls back to memory. Choosing system mode with no color forgets the entry. Another tab's change updates the open controls.

## API

{% api "mnw-theme-button" "mnw-theme-controls" "mnw-color-picker" "mnw-hct-slider" %}

Methods: `show()`, `close()` and `toggle()` on the button, `reset()` on the controls.

## Module exports

| Layer  | Exports                                                                                                                                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain | `colorScheme`, `colorThemeCss`, `hctFromHex`, `hexFromHct`, `normalizeHex`, `isColorMode`, `isColorVariant`, `COLOR_MODES`, `COLOR_VARIANTS`, `COLOR_ROLES`, `HCT_RANGES`, `DEFAULT_SOURCE_COLOR`, types `ColorMode`, `ColorVariant`, `ColorRole`, `ColorTheme`, `ColorSchemeOptions`, `HctColor`, `HctChannel` |
| Data   | `createThemePreferenceStore`, `normalizeThemePreference`, `DEFAULT_THEME_STORAGE_KEY`, types `ThemePreference`, `ThemePreferenceStore`                                                                                                                                                                          |
| UI     | `applyColorTheme`, `MaterialNextThemeButton` (`<mnw-theme-button>`), `MaterialNextThemeControls` (`<mnw-theme-controls>`), `MaterialNextColorPicker` (`<mnw-color-picker>`), `MaterialNextHctSlider` (`<mnw-hct-slider>`), event type `ColorThemeChangeEvent`                                                   |

## Accessibility

- The palette button reports `aria-expanded`; the panel is a labelled dialog. Escape closes it and returns focus to the button; a click outside closes it too.
- Each slider has a visible label, its accessible name, and shows its value while dragged. The gradients are decorative.
- The swatch is the native color input, so the system color dialog and its keyboard support come with it; it shows a focus ring.
- The color mode buttons are a labelled segmented button set, each with a name ("Dark color mode").
- In forced colors, the surfaces get a border and the swatch and gradients keep their real colors.

## Limitations

- Colors apply when the script runs; the saved mode is applied before first paint only when the page adds a small inline script, as this site does.
- `applyColorTheme()` themes `--md-sys-color-*` roles. Tokens of your own (a code background, a success color) keep their values.
