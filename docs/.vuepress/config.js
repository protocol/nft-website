// .vuepress/config.js

const DEPLOY_DOMAIN = 'https://nftschool.dev'
const SPEEDCURVE_ID = process.env.SPEEDCURVE_ID || ''
const COUNTLY_KEY = process.env.COUNTLY_KEY || ''
const pageSuffix = '/'

module.exports = {
  base: '/',
  head: require('./head'),
  locales: {
    '/': {
      lang: 'en-US',
      title: 'NFT School',
      description: 'NFT Developer Resources'
    }
  },
  markdown: {
    pageSuffix,
    extendMarkdown: md => {
      md.set({
        breaks: true
      })
      md.use(require('markdown-it-video'))
      md.use(require('markdown-it-footnote'))
      md.use(require('markdown-it-task-lists'))
      md.use(require('markdown-it-deflist')),
      md.use(require('markdown-it-imsize')),
      md.use(require('markdown-it-image-lazy-loading'))
    }
  },
  themeConfig: {
    defaultImage: '/images/social-card.png',
    author: {
      name: 'NFT School',
      twitter: '@protocollabs'
    },
    keywords:
      'NFT, non-fungible token, nonfungible token, Filecoin, IPFS, dweb, protocol, decentralized web, InterPlanetary File System, dapp, documentation, docs, tutorial, how-to, Protocol Labs',
    // edit links
    domain: DEPLOY_DOMAIN,
    docsRepo: 'protocol/nft-website',
    docsDir: 'docs',
    docsBranch: 'main',
    feedbackWidget: {
      docsRepoIssue: 'protocol/nft-website'
    },
    editLinks: false,
    // page nav
    nextLinks: false,
    prevLinks: false,
    // ui/ux
    logo: '/images/nftschool-logo.svg',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        ariaLabel: 'Select language',
        editLinkText: 'Edit this page',
        lastUpdated: 'Last Updated',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh'
          }
        },
        nav: require('./nav/en'),
        sidebar: [
          {
            title: 'Concepts',
            collapsable: false,
            children: [
              '/concepts/non-fungible-tokens',
              '/concepts/content-addressing',
              '/concepts/content-persistence',
              '/concepts/blockchains',
              '/concepts/distributed-web'
            ]
          },
          {
            title: 'Tutorials',
            collapsable: false,
            children: [
              '/tutorial/first-steps',
              '/tutorial/end-to-end-experience',
              '/tutorial/gallery-app',
              '/tutorial/minting-app',
              '/tutorial/using-nfts-in-games'
            ]
          },
          {
            title: 'How-tos',
            collapsable: false,
            children: [
              '/how-to/lazy-minting',
              '/how-to/minting-on-different-blockchains',
              '/how-to/managing-nfts',
              '/how-to/auditing-nfts'
            ]
          },
          {
            title: 'Reference',
            collapsable: false,
            children: 
            [
              '/reference/metadata-schemas',
              '/reference/nft-marketplaces',
              '/reference/example-apps-code-samples',
              '/reference/recommended-tools',
              '/reference/featured-sites'
            ]
          },
          {
            title: 'Contribute',
            collapsable: false,
            children: [
              '/contribute/'
            ]
          }
        ]
      }
    },
    algolia: {
      apiKey: '13321c2a92ae47463cda952cb6d5f332',
      indexName: 'nftschool'
    },
  },
  plugins: [
    [require('./plugins/vuepress-plugin-speedcurve'), { id: SPEEDCURVE_ID }],
    [require('./plugins/vuepress-plugin-countly'), {
      domain: DEPLOY_DOMAIN,
      key: COUNTLY_KEY
    }],
    [
      'vuepress-plugin-clean-urls',
      {
        normalSuffix: pageSuffix,
        indexSuffix: pageSuffix,
        notFoundPath: '/ipfs-404.html'
      }
    ],
    [
      'vuepress-plugin-seo',
      {
        siteTitle: ($page, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description,
        author: ($page, $site) =>
          $page.frontmatter.author || $site.themeConfig.author,
        tags: $page => $page.frontmatter.tags,
        twitterCard: _ => 'summary_large_image',
        type: $page =>
          ['articles', 'posts', 'blog'].some(folder =>
            $page.regularPath.startsWith('/' + folder)
          )
            ? 'article'
            : 'website',
        url: ($page, $site, path) => ($site.themeConfig.domain || '') + path,
        image: ($page, $site) =>
          $page.frontmatter.image
            ? ($site.themeConfig.domain || '') + $page.frontmatter.image
            : ($site.themeConfig.domain || '') + $site.themeConfig.defaultImage,
        publishedAt: $page =>
          $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
        customMeta: (add, context) => {
          const { $site, image } = context
          add(
            'twitter:site',
            ($site.themeConfig.author && $site.themeConfig.author.twitter) || ''
          )
          add('image', image)
          add('keywords', $site.themeConfig.keywords)
        }
      }
    ],
    [
      'vuepress-plugin-canonical',
      {
        // add <link rel="canonical" header (https://tools.ietf.org/html/rfc6596)
        // to deduplicate SEO across all copies loaded from various public gateways
        baseURL: DEPLOY_DOMAIN
      }
    ],
    [
      'vuepress-plugin-sitemap',
      {
        hostname: DEPLOY_DOMAIN,
        exclude: ['/ipfs-404.html']
      }
    ],
    [
      'vuepress-plugin-robots',
      {
        host: DEPLOY_DOMAIN
      }
    ],
    [
      '@vuepress/html-redirect',
      {
        countdown: 0
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'callout',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'right',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'left',
        defaultTitle: ''
      }
    ],
    'vuepress-plugin-chunkload-redirect',
    'vuepress-plugin-ipfs'
  ],
  extraWatchFiles: ['.vuepress/nav/en.js']
}
