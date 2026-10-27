// The author's social profiles for the site footer, as on the Profile site.
// Brand marks are Font Awesome Free SVGs, inlined with their license comment.
const {readFileSync} = require('node:fs');
const {join} = require('node:path');

const brands = join(
  __dirname,
  '../../node_modules/@fortawesome/fontawesome-free/svgs/brands'
);

const mark = (name) =>
  readFileSync(join(brands, `${name}.svg`), 'utf8')
    .trim()
    .replace(
      '<svg ',
      '<svg width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false" '
    );

const PROFILES = [
  ['github', 'GitHub', 'https://github.com/MihaiCristianCondrea'],
  ['instagram', 'Instagram', 'https://www.instagram.com/d4rk7355608/'],
  ['youtube', 'YouTube', 'https://www.youtube.com/@D4rK7355608'],
  ['pinterest', 'Pinterest', 'https://www.pinterest.com/d4rk7355608/'],
  [null, 'Email', 'mailto:contact.mihaicristiancondrea@gmail.com'],
  [
    'linkedin-in',
    'LinkedIn',
    'https://www.linkedin.com/in/mihai-cristian-condrea/',
  ],
  ['x-twitter', 'X', 'https://x.com/MihaiCrstian'],
  ['facebook-f', 'Facebook', 'https://www.facebook.com/d4rk7355608'],
];

/** One Material icon button per profile, for `<mnw-site-footer>`. */
module.exports = () =>
  PROFILES.map(([icon, label, href]) => {
    const external = href.startsWith('https:');
    return `<md-icon-button href="${href}"${
      external ? ' target="_blank"' : ''
    } aria-label="${label}" title="${label}">${
      icon ? mark(icon) : '<md-icon>mail</md-icon>'
    }</md-icon-button>`;
  }).join('\n        ');
