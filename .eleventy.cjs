const lib = require('./docs-src/_includes/lib.cjs');
const {createHash} = require('node:crypto');
const {existsSync, readFileSync} = require('node:fs');
const {copyFile} = require('node:fs/promises');
const {relative, resolve, sep} = require('node:path');
const {fileURLToPath, pathToFileURL} = require('node:url');

module.exports = function (eleventyConfig) {
  // Copy the generated stylesheet after rendering, so transforms and readers
  // cannot encounter a half-written destination during passthrough copying.
  eleventyConfig.on('eleventy.after', () =>
    copyFile('docs-src/docs.css', 'docs/docs.css')
  );
  eleventyConfig.addPassthroughCopy('docs-src/.nojekyll');
  eleventyConfig.addPassthroughCopy({public: '.'});
  // The sample product's own theme and data, used by the live demos.
  eleventyConfig.addPassthroughCopy({'docs-src/demos/assets': 'demos/assets'});
  // Device frames, launcher icons and the Google Play badge, as a hub copies them with
  // `mnw-marketing-assets`; the docs bundle points configureMarketingAssets() here.
  eleventyConfig.addPassthroughCopy({
    'assets/marketing/device-frames': 'material-next/device-frames',
    'assets/marketing/launcher': 'material-next/launcher',
    'assets/marketing/badges/google-play/en_badge_web_generic.png':
      'material-next/badges/google-play/en_badge_web_generic.png',
  });
  eleventyConfig.addPassthroughCopy(
    'node_modules/@webcomponents/webcomponentsjs'
  );
  eleventyConfig.addPassthroughCopy('node_modules/lit/polyfill-support.js');
  eleventyConfig.addWatchTarget('custom-elements.json');
  eleventyConfig.addWatchTarget('CHANGELOG.md');
  eleventyConfig.on('eleventy.before', lib.resetManifest);

  // Fenced code renders as <mnw-code-block> with a plain <pre> fallback.
  eleventyConfig.amendLibrary('md', (md) => {
    // Tables scroll inside their own focusable region on narrow screens,
    // instead of widening the page.
    md.renderer.rules.table_open = () =>
      '<div class="table-wrap" role="region" tabindex="0" aria-label="Table"><table>\n';
    md.renderer.rules.table_close = () => '</table></div>\n';
    md.renderer.rules.fence = (tokens, index) => {
      const token = tokens[index];
      const language = token.info.trim().split(/\s+/)[0] || 'text';
      return `${lib.codeBlock(language, token.content)}\n`;
    };
  });

  eleventyConfig.addTransform('version-assets', function (content) {
    if (!(this.page.outputPath || '').endsWith('.html')) return content;
    const outputRoot = resolve('docs') + sep;
    const baseHref = /<base\s+href="([^"]+)"/i.exec(content)?.[1] ?? './';
    const documentBase = new URL(
      baseHref,
      pathToFileURL(resolve(this.page.outputPath))
    );
    if (documentBase.protocol !== 'file:') return content;
    return content.replace(
      /(src|href)="([^"?#]+\.(?:js|css))"/g,
      (tag, attribute, href) => {
        if (/^(?:[a-z]+:|\/\/|\/)/i.test(href)) return tag;
        const file = fileURLToPath(new URL(href, documentBase));
        if (!file.startsWith(outputRoot)) return tag;
        const asset = relative(resolve('docs'), file).replaceAll('\\', '/');
        const source =
          asset === 'docs.css'
            ? resolve('docs-src/docs.css')
            : asset.startsWith('demos/assets/')
              ? resolve('docs-src', asset)
              : asset.startsWith('node_modules/')
                ? resolve(asset)
                : file;
        if (!existsSync(source)) return tag;
        const version = createHash('sha256')
          .update(readFileSync(source))
          .digest('hex')
          .slice(0, 12);
        return `${attribute}="${href}?v=${version}"`;
      }
    );
  });

  eleventyConfig.addTransform('table-labels', function (content) {
    return (this.page.outputPath || '').endsWith('.html')
      ? lib.labelTables(content)
      : content;
  });

  eleventyConfig.addShortcode('demo', (id, caption, stage) =>
    lib.demo(id, caption, {stage})
  );
  eleventyConfig.addShortcode('preview', (id, caption, stage) =>
    lib.demo(id, caption, {code: false, stage})
  );
  eleventyConfig.addShortcode('source', (file, language) =>
    lib.source(file, language)
  );
  eleventyConfig.addShortcode('api', (...tags) =>
    tags.map((tag) => lib.apiTables(tag, {heading: tags.length > 1})).join('')
  );

  eleventyConfig.addCollection('reference', (api) =>
    api
      .getFilteredByTag('reference')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
  );

  return {
    dir: {
      input: 'docs-src',
      output: 'docs',
    },
    markdownTemplateEngine: 'liquid',
    templateExtensionAliases: {
      '11ty.cjs': '11ty.js',
      '11tydata.cjs': '11tydata.js',
    },
  };
};
