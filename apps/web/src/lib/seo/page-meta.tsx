import { Helmet } from 'react-helmet-async'
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  formatPageTitle,
  SITE_NAME,
  TWITTER_HANDLE,
} from './site'
import type { OpenGraphType, SeoMeta } from './types'

export type PageMetaProps = Partial<SeoMeta> & {
  /** When true, skip rendering (used when a child page sets its own meta). */
  disabled?: boolean
}

function normalizeJsonLd(
  jsonLd?: Record<string, unknown> | Record<string, unknown>[],
): Record<string, unknown>[] {
  if (!jsonLd) return []
  return Array.isArray(jsonLd) ? jsonLd : [jsonLd]
}

/** Sets document `<head>` tags for SEO, social previews and structured data. */
export function PageMeta({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  publishedTime,
  jsonLd,
  disabled = false,
}: PageMetaProps) {
  if (disabled) return null

  const pageTitle = formatPageTitle(title)
  const canonical = absoluteUrl(path)
  const ogImage = image.startsWith('http') ? image : absoluteUrl(image)
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow'
  const ldScripts = normalizeJsonLd(jsonLd)

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType satisfies OpenGraphType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}

      {ldScripts.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}

/** Convenience wrapper for pages that fully own their SEO metadata. */
export function SeoHead(meta: SeoMeta) {
  return <PageMeta {...meta} />
}

export type { SeoMeta }
