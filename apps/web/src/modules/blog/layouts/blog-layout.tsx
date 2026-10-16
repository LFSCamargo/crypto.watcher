import { Outlet } from 'react-router-dom'
import { MapTrifold, Newspaper, Rocket } from '@phosphor-icons/react'
import { ResourceLayout } from '../../../components/layout/resource-layout'
import { blogPostMeta } from '../lib/posts'

const blogLinks = [
  { href: '/blog', label: 'All posts', icon: Newspaper },
  ...blogPostMeta.map((post) => ({
    href: `/blog/${post.slug}`,
    label: post.navLabel,
    icon: post.featured ? Rocket : MapTrifold,
  })),
]

export function BlogLayout() {
  return (
    <ResourceLayout navLabel="Blog" links={blogLinks}>
      <Outlet />
    </ResourceLayout>
  )
}
