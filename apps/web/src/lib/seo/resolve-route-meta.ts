import { blogPostMeta } from '../../modules/blog/lib/blog-post-meta'
import { curatedProjects } from '../../modules/projects/lib/curated-projects'
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  projectReviewJsonLd,
  websiteJsonLd,
} from './json-ld'
import { DEFAULT_DESCRIPTION, SITE_NAME } from './site'
import type { SeoMeta } from './types'

const staticRoutes: Record<string, Omit<SeoMeta, 'path'>> = {
  '/': {
    title: `${SITE_NAME} — Risk Review on the Blockchain`,
    description:
      'Expert-governed crypto risk scores and structured reports. Decide whether a project is safe to invest in before you allocate capital.',
    jsonLd: [websiteJsonLd(), organizationJsonLd()],
  },
  '/app': {
    title: 'Safe Projects — Expert Risk Scores',
    description:
      'Browse crypto projects reviewed by the Crypto Watcher governor council. Official risk scores, methodology and audit trail.',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Safe Projects', path: '/app' },
    ]),
  },
  '/app/in-analysis': {
    title: 'Projects In Analysis',
    description:
      'Track crypto projects currently under expert governor review on Crypto Watcher.',
  },
  '/app/analysis-request': {
    title: 'Request a Project Review',
    description:
      'Submit a crypto project for official risk analysis by the Crypto Watcher governor council.',
  },
  '/app/governance': {
    title: 'Protocol Governance',
    description:
      'On-chain governance proposals for Crypto Watcher protocol parameters, reviewer roster and methodology.',
  },
  '/blog': {
    title: 'Blog',
    description:
      'News, product updates and vision from the Crypto Watcher team — expert-governed crypto risk review.',
  },
  '/docs': {
    title: 'Documentation',
    description:
      'Learn how Crypto Watcher works: expert governor reviews, protocol governance and review methodology.',
  },
  '/docs/whitepaper': {
    title: 'Whitepaper',
    description:
      'Crypto Watcher whitepaper — expert-governed risk analysis for crypto projects and protocols.',
  },
  '/docs/tokenomics': {
    title: 'Tokenomics',
    description:
      'WATCH governance token economics — protocol governance only, not vote-to-rate on project scores.',
  },
  '/docs/governance': {
    title: 'Governance Guide',
    description:
      'How Crypto Watcher on-chain governance manages the reviewer council, methodology and protocol settings.',
  },
  '/docs/faq': {
    title: 'FAQ',
    description:
      'Frequently asked questions about Crypto Watcher reviews, scores, governance and the governor council.',
  },
  '/auth/signin': {
    title: 'Sign In',
    description: 'Sign in to your Crypto Watcher account.',
    noIndex: true,
  },
  '/auth/signup': {
    title: 'Create Account',
    description: 'Create a Crypto Watcher account to comment, submit evidence and request reviews.',
    noIndex: true,
  },
  '/auth/verify-otp': {
    title: 'Verify Email',
    description: 'Verify your email address to activate your Crypto Watcher account.',
    noIndex: true,
  },
  '/auth/forgot-password': {
    title: 'Forgot Password',
    description: 'Reset your Crypto Watcher account password.',
    noIndex: true,
  },
  '/auth/reset-password': {
    title: 'Reset Password',
    description: 'Choose a new password for your Crypto Watcher account.',
    noIndex: true,
  },
  '/auth/onboarding': {
    title: 'Account Setup',
    description: 'Complete your Crypto Watcher account setup.',
    noIndex: true,
  },
  '/app/admin': {
    title: 'Admin',
    description: 'Crypto Watcher team administration.',
    noIndex: true,
  },
  '/app/profile': {
    title: 'Profile',
    description: 'Your Crypto Watcher profile.',
    noIndex: true,
  },
  '/app/me': {
    title: 'Profile',
    description: 'Your Crypto Watcher profile.',
    noIndex: true,
  },
}

const blogBySlug = new Map(blogPostMeta.map((post) => [post.slug, post]))
const projectBySlug = new Map(curatedProjects.map((project) => [project.slug, project]))

function withPath(path: string, meta: Omit<SeoMeta, 'path'>): SeoMeta {
  return { path, ...meta }
}

function matchBlogPost(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/blog\/([^/]+)$/)
  if (!match) return undefined
  const post = blogBySlug.get(match[1]!)
  if (!post) return undefined

  const path = `/blog/${post.slug}`
  return withPath(path, {
    title: post.title,
    description: post.excerpt,
    ogType: 'article',
    publishedTime: `${post.date}T12:00:00.000Z`,
    jsonLd: [
      articleJsonLd({
        title: post.title,
        description: post.excerpt,
        path,
        datePublished: `${post.date}T12:00:00.000Z`,
      }),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.navLabel, path },
      ]),
    ],
  })
}

function matchReferenceProject(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/app\/reference\/([^/]+)$/)
  if (!match) return undefined
  const project = projectBySlug.get(match[1]!)
  if (!project) return undefined

  const path = `/app/reference/${project.slug}`
  const description = `${project.name} (${project.symbol}) risk review — score ${project.score}/100. ${project.description}`

  return withPath(path, {
    title: `${project.name} Risk Review — Score ${project.score}/100`,
    description,
    image: `/icons/${project.slug}.png`,
    jsonLd: [
      projectReviewJsonLd({
        name: project.name,
        description: project.description,
        path,
        score: project.score,
      }),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Safe Projects', path: '/app' },
        { name: project.name, path },
      ]),
    ],
  })
}

function matchLiveProject(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/app\/projects\/([^/]+)$/)
  if (!match) return undefined
  const slug = match[1]!
  const path = `/app/projects/${slug}`
  return withPath(path, {
    title: `${slug} Risk Review`,
    description: `Expert governor risk review and official score for ${slug} on Crypto Watcher.`,
  })
}

function matchGovernanceProposal(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/app\/governance\/([^/]+)$/)
  if (!match) return undefined
  const id = match[1]!
  const path = `/app/governance/${id}`
  return withPath(path, {
    title: `Governance Proposal #${id}`,
    description: `Crypto Watcher protocol governance proposal #${id}.`,
  })
}

function matchReputation(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/app\/u\/([^/]+)$/)
  if (!match) return undefined
  const path = `/app/u/${match[1]!}`
  return withPath(path, {
    title: 'Governor Reputation',
    description: 'Council governor credentials and accountability weight on Crypto Watcher.',
    ogType: 'profile',
    noIndex: true,
  })
}

function matchVote(pathname: string): SeoMeta | undefined {
  const match = pathname.match(/^\/app\/projects\/([^/]+)\/vote$/)
  if (!match) return undefined
  return withPath(pathname, {
    title: 'Project Voting',
    description: DEFAULT_DESCRIPTION,
    noIndex: true,
  })
}

/** Resolve SEO metadata for a client-side route pathname. */
export function resolveRouteMeta(pathname: string): SeoMeta {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  const dynamic =
    matchBlogPost(normalized) ??
    matchReferenceProject(normalized) ??
    matchLiveProject(normalized) ??
    matchGovernanceProposal(normalized) ??
    matchReputation(normalized) ??
    matchVote(normalized)

  if (dynamic) return dynamic

  const staticMeta = staticRoutes[normalized]
  if (staticMeta) return withPath(normalized, staticMeta)

  return withPath(normalized, {
    title: 'Page Not Found',
    description: DEFAULT_DESCRIPTION,
    noIndex: true,
  })
}

/** All indexable paths for sitemap generation (build-time). */
export function getIndexablePaths(): string[] {
  const paths = new Set<string>([
    '/',
    '/app',
    '/app/in-analysis',
    '/app/analysis-request',
    '/app/governance',
    '/blog',
    '/docs',
    '/docs/whitepaper',
    '/docs/tokenomics',
    '/docs/governance',
    '/docs/faq',
  ])

  for (const post of blogPostMeta) {
    paths.add(`/blog/${post.slug}`)
  }

  for (const project of curatedProjects) {
    paths.add(`/app/reference/${project.slug}`)
  }

  return [...paths].sort()
}
