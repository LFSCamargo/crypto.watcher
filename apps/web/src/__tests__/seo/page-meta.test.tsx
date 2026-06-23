import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { describe, expect, it } from 'vitest'
import { PageMeta } from '../../lib/seo/page-meta'

function renderMeta(props: Parameters<typeof PageMeta>[0] = {}) {
  return render(
    <HelmetProvider>
      <PageMeta {...props} />
    </HelmetProvider>,
  )
}

describe('PageMeta', () => {
  it('sets title and description tags', async () => {
    renderMeta({
      title: 'Bitcoin Risk Review',
      description: 'Expert score for Bitcoin.',
      path: '/app/reference/bitcoin',
    })

    await waitFor(() => {
      expect(document.title).toContain('Bitcoin Risk Review')
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
        'Expert score for Bitcoin.',
      )
    })
  })

  it('sets canonical and open graph URLs', async () => {
    renderMeta({
      title: 'Blog',
      description: 'Updates from Crypto Watcher.',
      path: '/blog',
    })

    await waitFor(() => {
      const canonical = document.querySelector('link[rel="canonical"]')
      expect(canonical?.getAttribute('href')).toMatch(/\/blog$/)

      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toMatch(
        /\/blog$/,
      )
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toContain(
        'Blog',
      )
    })
  })

  it('marks private routes as noindex', async () => {
    renderMeta({
      title: 'Sign In',
      description: 'Sign in.',
      path: '/auth/signin',
      noIndex: true,
    })

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, nofollow',
      )
    })
  })

  it('renders JSON-LD scripts', async () => {
    renderMeta({
      title: 'Home',
      description: 'Crypto Watcher home.',
      path: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Crypto Watcher',
      },
    })

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      expect(script?.textContent).toContain('"@type":"WebSite"')
    })
  })
})
