---
layout: example.11ty.cjs
title: Workshop Expressive Web Components ⌲ Examples ⌲ Code block
tags: example
name: Code block
description: ws-code-block copyable snippets with themed syntax
order: 8
---

<p>Code blocks present copyable snippets with syntax highlighting that follows the current documentation theme.</p>

## Live demo

<div class="demo-panel component-demo">
  <ws-code-block language="html" copy>
<template>
<ws-button variant="primary">
  <i slot="icon" class="ri-add-line" aria-hidden="true"></i>
  Create
</ws-button>
</template>
  </ws-code-block>
</div>

## Code

```html
<ws-code-block language="html" copy>
  <template>
    <ws-button variant="primary">
      <i slot="icon" class="ri-add-line" aria-hidden="true"></i>
      Create
    </ws-button>
  </template>
</ws-code-block>
```

## API

| Property   | Type      | Default  | Description                                  |
| ---------- | --------- | -------- | -------------------------------------------- |
| `language` | `string`  | `'html'` | Language label and highlighter hint.         |
| `code`     | `string`  | —        | Optional code source supplied as a property. |
| `copy`     | `boolean` | `false`  | Shows a copy button.                         |

## Slots

| Slot    | Description                                                                                  |
| ------- | -------------------------------------------------------------------------------------------- |
| default | Code source. Wrap HTML snippets in a `template` element so the browser does not render them. |

## Events

| Event          | Detail     | Description                           |
| -------------- | ---------- | ------------------------------------- |
| `ws-code-copy` | `{ code }` | Fired after the copy action succeeds. |

## Accessibility notes

- Keep the language label accurate so assistive tooling and users understand the snippet.
- Use the `copy` affordance for snippets people are expected to reuse.

## Design notes

- Pair live demos with the smallest complete snippet that recreates the example.
- Avoid unrelated setup code inside component examples.
