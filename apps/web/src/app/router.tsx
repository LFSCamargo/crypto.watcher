import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { LandingPage } from '../modules/marketing/routes'
import {
  DocsLayout,
  DocsIntroduction,
  DocsWhitepaper,
  DocsTokenomics,
  DocsGovernance,
  DocsFAQ,
} from '../modules/docs/routes'
import { GovernanceDetailPage, GovernancePage } from '../modules/governance/routes'
import {
  AdminProjectsPage,
  ProjectDetailPage,
  ProjectsPage,
  ReferenceProjectDetailPage,
} from '../modules/projects/routes'
import { ReputationPage } from '../modules/reputation/routes'
import { VotingPage } from '../modules/voting/routes'
import {
  SignInPage,
  SignUpPage,
  OnboardingPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '../modules/auth/routes'
import { InAnalysisPage, AnalysisRequestPage } from '../modules/analysis/routes'
import { ProfilePage } from '../modules/profile/routes'

function LegacyProjectRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/app/reference/${slug ?? ''}`} replace />
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
      { path: 'analysis', element: <Navigate to="/app/in-analysis" replace /> },
      { path: 'auth/signin', element: <SignInPage /> },
      { path: 'auth/signup', element: <SignUpPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },
      { path: 'auth/onboarding', element: <OnboardingPage /> },
      {
        path: 'docs',
        element: <DocsLayout />,
        children: [
          { index: true, element: <DocsIntroduction /> },
          { path: 'whitepaper', element: <DocsWhitepaper /> },
          { path: 'tokenomics', element: <DocsTokenomics /> },
          { path: 'governance', element: <DocsGovernance /> },
          { path: 'faq', element: <DocsFAQ /> },
        ],
      },
      {
        path: 'app',
        children: [
          { index: true, element: <ProjectsPage /> },
          { path: 'projects/:slug', element: <ProjectDetailPage /> },
          { path: 'reference/:slug', element: <ReferenceProjectDetailPage /> },
          { path: 'projects/:slug/vote', element: <VotingPage /> },
          { path: 'in-analysis', element: <InAnalysisPage /> },
          { path: 'analysis-request', element: <AnalysisRequestPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'governance', element: <GovernancePage /> },
          { path: 'governance/:onchainId', element: <GovernanceDetailPage /> },
          { path: 'u/:address', element: <ReputationPage /> },
          { path: 'me', element: <ProfilePage /> },
          { path: 'admin', element: <AdminProjectsPage /> },
        ],
      },
    ],
  },
])
