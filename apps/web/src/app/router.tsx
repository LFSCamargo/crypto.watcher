import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { GovernanceDetailPage, GovernancePage } from '../modules/governance/routes'
import {
  AdminProjectsPage,
  ProjectDetailPage,
  ProjectsPage,
} from '../modules/projects/routes'
import { ReputationPage } from '../modules/reputation/routes'
import { MePage } from '../modules/users/routes'
import { VotingPage } from '../modules/voting/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: 'projects/:slug/vote', element: <VotingPage /> },
      { path: 'governance', element: <GovernancePage /> },
      { path: 'governance/:onchainId', element: <GovernanceDetailPage /> },
      { path: 'u/:address', element: <ReputationPage /> },
      { path: 'me', element: <MePage /> },
      { path: 'admin', element: <AdminProjectsPage /> },
    ],
  },
])
