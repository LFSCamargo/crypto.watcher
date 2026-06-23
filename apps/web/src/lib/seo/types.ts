export type OpenGraphType = 'website' | 'article' | 'profile'

export type SeoMeta = {
  title: string
  description: string
  /** Site-relative path used for canonical URLs, e.g. `/blog/launch-story`. */
  path: string
  image?: string
  ogType?: OpenGraphType
  noIndex?: boolean
  /** ISO-8601 date for articles. */
  publishedTime?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}
