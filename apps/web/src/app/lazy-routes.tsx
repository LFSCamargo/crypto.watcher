import { Suspense, lazy, type ReactNode } from 'react'
import { Skeleton } from '../components/ui'

/** Lightweight fallback while lazy route chunks load. */
export function RouteFallback() {
  return (
    <div className="space-y-4 py-8" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

export const NotFoundPage = lazy(() =>
  import('../modules/marketing/pages/not-found-page').then((m) => ({
    default: m.NotFoundPage,
  })),
)

export const DocsLayout = lazy(() =>
  import('../modules/docs/layouts/docs-layout').then((m) => ({ default: m.DocsLayout })),
)
export const DocsIntroduction = lazy(() =>
  import('../modules/docs/content/introduction').then((m) => ({
    default: m.DocsIntroduction,
  })),
)
export const DocsWhitepaper = lazy(() =>
  import('../modules/docs/content/whitepaper').then((m) => ({
    default: m.DocsWhitepaper,
  })),
)
export const DocsTokenomics = lazy(() =>
  import('../modules/docs/content/tokenomics').then((m) => ({
    default: m.DocsTokenomics,
  })),
)
export const DocsGovernance = lazy(() =>
  import('../modules/docs/content/governance').then((m) => ({
    default: m.DocsGovernance,
  })),
)
export const DocsFAQ = lazy(() =>
  import('../modules/docs/content/faq').then((m) => ({ default: m.DocsFAQ })),
)

export const BlogLayout = lazy(() =>
  import('../modules/blog/layouts/blog-layout').then((m) => ({ default: m.BlogLayout })),
)
export const BlogIndexPage = lazy(() =>
  import('../modules/blog/pages/blog-index-page').then((m) => ({
    default: m.BlogIndexPage,
  })),
)
export const BlogPostPage = lazy(() =>
  import('../modules/blog/pages/blog-post-page').then((m) => ({
    default: m.BlogPostPage,
  })),
)

export const GovernancePage = lazy(() =>
  import('../modules/governance/pages/governance-page').then((m) => ({
    default: m.GovernancePage,
  })),
)
export const GovernanceDetailPage = lazy(() =>
  import('../modules/governance/pages/governance-detail-page').then((m) => ({
    default: m.GovernanceDetailPage,
  })),
)

export const ProjectsPage = lazy(() =>
  import('../modules/projects/pages/projects-page').then((m) => ({
    default: m.ProjectsPage,
  })),
)
export const ProjectDetailPage = lazy(() =>
  import('../modules/projects/pages/project-detail-page').then((m) => ({
    default: m.ProjectDetailPage,
  })),
)
export const ReferenceProjectDetailPage = lazy(() =>
  import('../modules/projects/pages/reference-project-detail-page').then((m) => ({
    default: m.ReferenceProjectDetailPage,
  })),
)
export const AdminProjectsPage = lazy(() =>
  import('../modules/projects/pages/admin-projects-page').then((m) => ({
    default: m.AdminProjectsPage,
  })),
)

export const ReputationPage = lazy(() =>
  import('../modules/reputation/pages/reputation-page').then((m) => ({
    default: m.ReputationPage,
  })),
)

export const SignInPage = lazy(() =>
  import('../modules/auth/pages/sign-in-page').then((m) => ({ default: m.SignInPage })),
)
export const SignUpPage = lazy(() =>
  import('../modules/auth/pages/sign-up-page').then((m) => ({ default: m.SignUpPage })),
)
export const OnboardingPage = lazy(() =>
  import('../modules/auth/pages/onboarding-page').then((m) => ({
    default: m.OnboardingPage,
  })),
)
export const ForgotPasswordPage = lazy(() =>
  import('../modules/auth/pages/forgot-password-page').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
export const ResetPasswordPage = lazy(() =>
  import('../modules/auth/pages/reset-password-page').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
export const VerifyOtpPage = lazy(() =>
  import('../modules/auth/pages/verify-otp-page').then((m) => ({
    default: m.VerifyOtpPage,
  })),
)

export const AnalysisRequestPage = lazy(() =>
  import('../modules/analysis/pages/analysis-request-page').then((m) => ({
    default: m.AnalysisRequestPage,
  })),
)

export const ProfilePage = lazy(() =>
  import('../modules/profile/pages/profile-page').then((m) => ({
    default: m.ProfilePage,
  })),
)
