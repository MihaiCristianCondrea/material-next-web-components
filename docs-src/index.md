---
layout: page.11ty.cjs
title: material-next-web-components ⌲ Home
---

<section class="hero-panel">
  <p class="eyebrow">Material Design Lit components</p>
  <h1>Build Material-inspired product surfaces with web components.</h1>
  <p class="lede">`material-next-web-components` packages focused Lit custom elements for documentation, navigation, code presentation, and product showcases. Start here, then use the examples pages for detailed recipes.</p>
  <div class="hero-actions">
    <a class="button-link button-link--filled" href="./install/">Get started</a>
    <a class="button-link" href="./examples/">View examples</a>
    <a class="button-link" href="https://github.com/MihaiCristianCondrea/material-next-web-components">GitHub</a>
  </div>
</section>

## Install

Install the component package next to Material Web:

<div class="code-block-demo">
<mnw-code-block language="bash" copy><template>
npm install material-next-web-components @material/web
</template></mnw-code-block>
</div>

> Package publishing is still being prepared in this repository. Until the package is published to npm, clone the GitHub repository and use the local build workflow from the README.

## Quick start

Import only the component modules you need, then use the custom element in HTML:

<div class="code-block-demo">
<mnw-code-block language="ts" copy><template>
import 'material-next-web-components/code-block.js';
</template></mnw-code-block>
</div>

<div class="code-block-demo">
<mnw-code-block language="html" copy><template>
<mnw-code-block language="ts" copy>
  <template>console.log('Hello Material Next');</template>
</mnw-code-block>
</template></mnw-code-block>
</div>

## What is included?

<section class="feature-grid">
  <article class="feature-card">
    <h2>Product views</h2>
    <p>Reusable app and documentation surfaces such as the home view and app showcase.</p>
    <a href="./examples/home-view/">Explore home view</a>
  </article>
  <article class="feature-card">
    <h2>Navigation</h2>
    <p>Expressive tabs, vertical examples navigation, and table-of-contents patterns.</p>
    <a href="./examples/docs-navigation/">Explore navigation</a>
  </article>
  <article class="feature-card">
    <h2>Documentation utilities</h2>
    <p>Copy-ready code blocks and generated API pages for web component documentation.</p>
    <a href="./api/">View API</a>
  </article>
</section>

## Design baseline

The library builds on Lit, Material Web, Material Design tokens, and Google Sans typography. Detailed typography and styling guidance lives in the install and examples pages so this home page can stay focused on onboarding.

## Project links

- [GitHub repository](https://github.com/MihaiCristianCondrea/material-next-web-components)
- [Install guide](./install/)
- [Examples](./examples/)
- [API reference](./api/)
- [Roadmap and status](./roadmap/)
