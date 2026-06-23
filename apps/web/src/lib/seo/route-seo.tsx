import { useLocation } from 'react-router-dom'
import { PageMeta } from './page-meta'
import { resolveRouteMeta } from './resolve-route-meta'

/** Route-aware SEO tags — mount once in the app shell. */
export function RouteSeo() {
  const { pathname } = useLocation()
  const meta = resolveRouteMeta(pathname)
  return <PageMeta {...meta} />
}
