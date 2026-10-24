---
tags: reference
name: Code block
description: Readable, copyable code samples with Google Sans Code and lightweight syntax colours.
category: components
icon: code
status: stable
tagName: mnw-code-block
importPath: material-next-web-components/code-block.js
order: 10
---

## Overview

Use `<mnw-code-block>` for install commands, configuration and short examples in documentation, release notes or a product's developer page. It shows the language as a label, colours common tokens and, with `copy`, adds a Copy action that writes the code to the clipboard.

Use something else when the reader must edit code (an editor such as CodeMirror), when exact highlighting matters for a language the built-in tokenizer does not know, or for very long files: the block has no line numbers, folding or search.

## Live demo

{% demo "code-block" "Copy works on HTTPS and localhost; the events report each copy." "demo__stage--column" %}

## Usage

There are two ways to give it code:

- **The `code` attribute or property**, for one-liners and for code you build in JavaScript. Newlines are kept; in HTML write them as real line breaks or `&#10;`.
- **The default slot**, for multi-line markup. Wrap it in a `<template>` so the browser keeps it as text instead of rendering it. The block reads the slot's text content, so leading indentation is kept as written.

When both are present, `code` wins.

```html
<mnw-code-block language="ts" copy code="const ready = true;"></mnw-code-block>

<mnw-code-block language="html" copy>
  <template><md-filled-button>Install</md-filled-button></template>
</mnw-code-block>
```

`language` is the label shown in the header and picks the highlighter: `html` (or `markup`) colours tags and attributes; every other value, `text` included, uses one script-style tokenizer that colours comments, strings, JavaScript and TypeScript keywords, capitalised names and numbers.

## API

{% api "mnw-code-block" %}

The `copy` attribute is a boolean: present means on. Setting the property to `false` removes the attribute.

## Accessibility

- The code is a `<figure>` whose caption is the language label, around a `<pre>`, so assistive technology reads it as preformatted text.
- The Copy action is a Material Web assist chip, reachable with the keyboard. After a copy, "Copied" (or "Copy failed") is announced through a polite live region, and the chip shows "Copied" for 1.4 seconds.
- Syntax colours never carry meaning on their own.

## Styling

The block reads the page's Material colour roles (`--md-sys-color-*`) for its surfaces and the `--md-sys-color-code-*` properties above for tokens, with light and dark defaults. Load Google Sans Code for the code font; it falls back to the platform's monospace font.

## Limitations

- The highlighter is a small built-in tokenizer, not Prism or Shiki. It has no grammar per language, so Bash, CSS or JSON get the script-style colours, and CSS or scripts inside HTML are not coloured.
- Copy needs the Clipboard API, which browsers only allow in secure contexts (HTTPS or `localhost`). Listen for `mnw-code-copy-error` to offer another way.
- Long lines scroll horizontally inside the block; they do not wrap.
