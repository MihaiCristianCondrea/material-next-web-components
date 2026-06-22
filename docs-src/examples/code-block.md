---
layout: example.11ty.cjs
title: material-next-web-components ⌲ Examples ⌲ Code block
tags: example
name: Code block
description: Copy-ready code presentation with Google Sans Code typography
icon: code
tagName: mnw-code-block
order: 4
---

Use `<mnw-code-block>` for examples that should be readable, theme-aware, and easy to copy.

Syntax highlighting is intentionally lightweight and dependency-free. It supports focused examples for markup and script-like snippets; use plain text for languages that need exact tokenization beyond the built-in highlighter.

## Live demo

<div class="demo-panel">
  <mnw-code-block language="ts" copy code="const ready = true;"></mnw-code-block>
</div>

## Code

<mnw-code-block language="html" copy code='<mnw-code-block language="ts" copy code="const ready =
true;"></mnw-code-block>'></mnw-code-block>

## API

| Property   | Type      | Default  | Description                                  |
| ---------- | --------- | -------- | -------------------------------------------- |
| `language` | `string`  | `'text'` | Language label and syntax highlighting mode. |
| `code`     | `string`  | `''`     | Code snippet to render.                      |
| `copy`     | `boolean` | `false`  | Shows the copy-to-clipboard action.          |

## Slots

| Slot    | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| default | Alternative source for code when the `code` property is omitted. |

## Events

| Event           | Description                                         |
| --------------- | --------------------------------------------------- |
| `mnw-code-copy` | Fired after the snippet is copied to the clipboard. |

## Accessibility notes

- Use the language label to give readers context.
- Keep snippets focused so copied output is useful.
- Do not rely on syntax color alone to communicate meaning.

## Design notes

- Use Google Sans Code for all code presentation surfaces.
- Enable `copy` for install commands and multi-line examples.
- Pair long snippets with explanatory text before the block.

## Theming and integration

- Import `material-next-web-components/code-block.js` once for every page or bundle that uses the element.
- The component inherits Material color tokens and uses Google Sans Code for snippet content.
- Prefer the `code` property for short snippets and the default slot with a nested `<template>` for multi-line HTML examples.
- The highlighter is intentionally lightweight; use `language="text"` for snippets where exact tokenization matters more than color.
