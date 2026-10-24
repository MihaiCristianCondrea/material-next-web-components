const path = require('path').posix;

/** `target` (a site path such as "/install/") relative to the page at `base`. */
module.exports = (base, target) => {
  const [pathname, hash = ''] = target.split('#');
  let relativePath = path.relative(base, pathname);
  if (pathname.endsWith('/') && relativePath !== '' && !relativePath.endsWith('/')) {
    relativePath += '/';
  }
  if (relativePath === '') relativePath = './';
  return hash ? `${relativePath}#${hash}` : relativePath;
};
