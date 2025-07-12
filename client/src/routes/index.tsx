import { createBrowserRouter } from 'react-router-dom'
import { Suspense } from 'react'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Onboarding } from '@/pages/auth/Onboarding'
import { ErrorPage } from '@/pages/Error'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import AdminLayout from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { lazy } from 'react'

// Lazy load dashboard pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const Profile = lazy(() => import('@/pages/dashboard/Profile'))
const Swaps = lazy(() => import('@/pages/dashboard/Swaps'))
const NewSwap = lazy(() => import('@/pages/dashboard/NewSwap'))
const Chat = lazy(() => import('@/pages/dashboard/Chat'))
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'))
const Settings = lazy(() => import('@/pages/dashboard/Settings'))

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/pages/auth/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Users = lazy(() => import('@/pages/admin/Users'))
const Messages = lazy(() => import('@/pages/admin/Messages'))
const Skills = lazy(() => import('@/pages/admin/Skills'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'login',
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'register',
    element: (
      <ProtectedRoute requireAuth={false}>
        <Register />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'onboarding',
    element: (
      <ProtectedRoute requireAuth={true}>
        <Onboarding />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'admin/login',
    element: (
      <ProtectedRoute requireAuth={false}>
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute requireAuth>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'messages',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Messages />
          </Suspense>
        ),
      },
      {
        path: 'skills',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Skills />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute requireAuth>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'swaps',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Swaps />
          </Suspense>
        ),
      },
      {
        path: 'swaps/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NewSwap />
          </Suspense>
        ),
      },
      {
        path: 'chat',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Chat />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]) 