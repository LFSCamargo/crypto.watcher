import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/app-layout'
import { ProjectsPage } from '../features/projects/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <ProjectsPage /> }],
  },
])
