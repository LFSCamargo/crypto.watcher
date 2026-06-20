import { createBrowserRouter } from 'react-router-dom'
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
import { MePage } from '../modules/users/routes'
import { VotingPage } from '../modules/voting/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
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
          { path: 'governance', element: <GovernancePage /> },
          { path: 'governance/:onchainId', element: <GovernanceDetailPage /> },
          { path: 'u/:address', element: <ReputationPage /> },
          { path: 'me', element: <MePage /> },
          { path: 'admin', element: <AdminProjectsPage /> },
        ],
      },
    ],
  },
])
