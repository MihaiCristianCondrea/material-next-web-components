---
layout: page.11ty.cjs
title: Material Design web components for Lit
---

<section class="home-hero" aria-labelledby="home-title">
<div>
<h1 id="home-title">Material Design components for product pages and app marketing</h1>
<p class="lede">Lit custom elements on Material Web: code blocks, navigation, app showcases, and a complete marketing hub for Android apps built with App Toolkit.</p>
<div class="home-actions">
<a class="btn btn--filled" href="./install/"><span class="material-symbols-outlined" aria-hidden="true">download</span>Install</a>
<a class="btn" href="./examples/">Browse components</a>
<a class="btn" href="./guides/marketing-hub/">Build a marketing hub</a>
</div>
</div>
<div class="home-hero__visual">
<mnw-code-block language="bash" copy code="npm install material-next-web-components lit @material/web"><pre class="code-fallback"><code>npm install material-next-web-components lit @material/web</code></pre></mnw-code-block>
<mnw-code-block language="ts" copy code="import 'material-next-web-components/code-block.js';&#10;import {mountMarketingGallery} from 'material-next-web-components/marketing.js';"><pre class="code-fallback"><code>import 'material-next-web-components/code-block.js';&#10;import {mountMarketingGallery} from 'material-next-web-components/marketing.js';</code></pre></mnw-code-block>
</div>
</section>

<section class="home-section" aria-labelledby="whats-inside">
<h2 id="whats-inside">What's inside</h2>
<p>Import only the modules you use. Each element follows the page's Material colour roles and works with Material Web's own components.</p>
<div class="feature-grid">
<article class="feature feature--wide">
<span class="material-symbols-outlined" aria-hidden="true">storefront</span>
<h3>Marketing hub</h3>
<p>Give the library an app's screens and product details; it provides the gallery, the prototype page, device frames, the Google Play badge, captures and a video embed API.</p>
<a href="./guides/marketing-hub/">Read the guide</a>
</article>
<article class="feature">
<span class="material-symbols-outlined" aria-hidden="true">code</span>
<h3>Code block</h3>
<p>Copyable samples with Google Sans Code and syntax colours. Stable.</p>
<a href="./examples/code-block/">Code block</a>
</article>
<article class="feature">
<span class="material-symbols-outlined" aria-hidden="true">tab</span>
<h3>Navigation</h3>
<p>Expressive tabs, a documentation sidebar and a table of contents, with cancelable navigation events.</p>
<a href="./examples/expressive-tab-bar/">Expressive tab bar</a>
</article>
<article class="feature">
<span class="material-symbols-outlined" aria-hidden="true">apps</span>
<h3>App showcase</h3>
<p>Cards for a developer's Android apps from a JSON endpoint.</p>
<a href="./examples/app-showcase/">App showcase</a>
</article>
<article class="feature">
<span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
<h3>Documentation layout</h3>
<p>The shell, top app bar and page this site is built with.</p>
<a href="./examples/docs-layout/">Docs shell and page</a>
</article>
<article class="feature">
<span class="material-symbols-outlined" aria-hidden="true">data_object</span>
<h3>API reference</h3>
<p>Properties, attributes, events, slots and styling hooks, generated from the source.</p>
<a href="./api/">API reference</a>
</article>
</div>
</section>

<section class="home-section" aria-labelledby="status">
<h2 id="status">Status</h2>
<p>Material Next is at version 0.2. The code block is stable; the other elements are experimental and can change between minor versions until 1.0, and the documentation layout elements are internal candidates. The <a href="./roadmap/">roadmap</a> lists each part's status.</p>
</section>
