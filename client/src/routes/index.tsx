import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Onboarding } from '@/pages/auth/Onboarding';
import { ErrorPage } from '@/pages/Error';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load dashboard pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Profile = lazy(() => import('@/pages/dashboard/Profile'));
const Swaps = lazy(() => import('@/pages/dashboard/Swaps'));
const NewSwap = lazy(() => import('@/pages/dashboard/NewSwap'));
const Chat = lazy(() => import('@/pages/dashboard/Chat'));
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'));
const Settings = lazy(() => import('@/pages/dashboard/Settings'));

const PageLoader = () => (
    <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
    </div>
);

export const router = createBrowserRouter([
    { path: '/', element: <Home />, errorElement: <ErrorPage /> },
    { path: 'login', element: <ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>, errorElement: <ErrorPage /> },
    { path: 'register', element: <ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>, errorElement: <ErrorPage /> },
    { path: 'onboarding', element: <ProtectedRoute requireAuth={true}><Onboarding /></ProtectedRoute>, errorElement: <ErrorPage /> },
    {
        element: <ProtectedRoute requireAuth><DashboardLayout /></ProtectedRoute>,
        errorElement: <ErrorPage />,
        children: [
            { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
            { path: 'profile', element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
            { path: 'swaps', element: <Suspense fallback={<PageLoader />}><Swaps /></Suspense> },
            { path: 'swaps/new', element: <Suspense fallback={<PageLoader />}><NewSwap /></Suspense> },
            { path: 'chat', element: <Suspense fallback={<PageLoader />}><Chat /></Suspense> },
            { path: 'notifications', element: <Suspense fallback={<PageLoader />}><Notifications /></Suspense> },
            { path: 'settings', element: <Suspense fallback={<PageLoader />}><Settings /></Suspense> },
        ],
    },
]);