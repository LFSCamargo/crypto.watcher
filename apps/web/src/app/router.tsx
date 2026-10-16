import { type ReactNode } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { IN_ANALYSIS_HREF } from '../components/layout/navigation'
import { GuestRoute } from '../modules/auth/components/guest-route'
import { LandingPage } from '../modules/marketing/routes'
import {
  AdminProjectsPage,
  AnalysisRequestPage,
  BlogIndexPage,
  BlogLayout,
  BlogPostPage,
  DocsFAQ,
  DocsGovernance,
  DocsIntroduction,
  DocsLayout,
  DocsTokenomics,
  DocsWhitepaper,
  ForgotPasswordPage,
  GovernanceDetailPage,
  GovernancePage,
  LazyRoute,
  NotFoundPage,
  OnboardingPage,
  ProfilePage,
  ProjectDetailPage,
  ProjectsPage,
  ReferenceProjectDetailPage,
  ReputationPage,
  ResetPasswordPage,
  SignInPage,
  SignUpPage,
  VerifyOtpPage,
} from './lazy-routes'

function LegacyProjectRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/app/reference/${slug ?? ''}`} replace />
}

function RetiredVoteRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/app/projects/${slug ?? ''}`} replace />
}

function withLazy(element: ReactNode) {
  return <LazyRoute>{element}</LazyRoute>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'projects', element: <Navigate to="/app" replace /> },
      { path: 'projects/:slug', element: <LegacyProjectRedirect /> },
      { path: 'profile', element: <Navigate to="/app/profile" replace /> },
      { path: 'analysis', element: <Navigate to={IN_ANALYSIS_HREF} replace /> },
      {
        element: <GuestRoute />,
        children: [
          { path: 'auth/signin', element: withLazy(<SignInPage />) },
          { path: 'auth/signup', element: withLazy(<SignUpPage />) },
          { path: 'auth/verify-otp', element: withLazy(<VerifyOtpPage />) },
          { path: 'auth/forgot-password', element: withLazy(<ForgotPasswordPage />) },
          { path: 'auth/reset-password', element: withLazy(<ResetPasswordPage />) },
        ],
      },
      { path: 'auth/onboarding', element: withLazy(<OnboardingPage />) },
      {
        path: 'blog',
        element: withLazy(<BlogLayout />),
        children: [
          { index: true, element: withLazy(<BlogIndexPage />) },
          { path: ':slug', element: withLazy(<BlogPostPage />) },
        ],
      },
      {
        path: 'docs',
        element: withLazy(<DocsLayout />),
        children: [
          { index: true, element: withLazy(<DocsIntroduction />) },
          { path: 'whitepaper', element: withLazy(<DocsWhitepaper />) },
          { path: 'tokenomics', element: withLazy(<DocsTokenomics />) },
          { path: 'governance', element: withLazy(<DocsGovernance />) },
          { path: 'faq', element: withLazy(<DocsFAQ />) },
        ],
      },
      {
        path: 'app',
        children: [
          { index: true, element: withLazy(<ProjectsPage />) },
          { path: 'projects/:slug', element: withLazy(<ProjectDetailPage />) },
          { path: 'reference/:slug', element: withLazy(<ReferenceProjectDetailPage />) },
          { path: 'projects/:slug/vote', element: <RetiredVoteRedirect /> },
          { path: 'in-analysis', element: <Navigate to={IN_ANALYSIS_HREF} replace /> },
          { path: 'analysis-request', element: withLazy(<AnalysisRequestPage />) },
          { path: 'profile', element: withLazy(<ProfilePage />) },
          { path: 'governance', element: withLazy(<GovernancePage />) },
          { path: 'governance/:onchainId', element: withLazy(<GovernanceDetailPage />) },
          { path: 'u/:address', element: withLazy(<ReputationPage />) },
          { path: 'me', element: withLazy(<ProfilePage />) },
          { path: 'admin', element: withLazy(<AdminProjectsPage />) },
        ],
      },
      { path: '*', element: withLazy(<NotFoundPage />) },
    ],
  },
])
