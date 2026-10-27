// Site-wide navigation and the groups of the component catalog.
module.exports = {
  name: 'Material Next',
  packageName: 'material-next-web-components',
  repository:
    'https://github.com/MihaiCristianCondrea/material-next-web-components',
  npm: 'https://www.npmjs.com/package/material-next-web-components',
  topLevel: [
    {href: '/', label: 'Home'},
    {href: '/install/', label: 'Install'},
    {href: '/examples/', label: 'Components'},
    {
      href: '/guides/marketing-hub/',
      label: 'Marketing hub',
      prefix: '/guides/',
    },
    {href: '/api/', label: 'API'},
    {href: '/roadmap/', label: 'Roadmap'},
    {href: '/changelog/', label: 'Changelog'},
  ],
  // Catalog groups, in sidebar and catalog order.
  categories: [
    {
      id: 'components',
      label: 'Components',
      description:
        'Standalone elements for product pages, navigation and code.',
    },
    {
      id: 'marketing',
      label: 'Marketing hub elements',
      description:
        'The pieces of the marketing hub, usable on their own: shell, cards, controls, device frames, badges and the prototype page.',
    },
    {
      id: 'layout',
      label: 'Documentation layout',
      description:
        'The shell and navigation this site is built with. Exported, but internal candidates: their API may change before 1.0.',
    },
    {
      id: 'guides',
      label: 'Guides',
      description: 'Workflows that combine several APIs.',
    },
  ],
  statuses: {
    stable: 'Stable',
    experimental: 'Experimental',
    internal: 'Internal candidate',
  },
};
