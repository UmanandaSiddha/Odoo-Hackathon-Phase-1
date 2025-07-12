import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from './ui/loading-spinner'
import { useAppSelector } from '@/hooks/reduxHooks'

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireOnboarding?: boolean;
}

export const ProtectedRoute = ({
    children,
    requireAuth = true,
    requireOnboarding = false,
}: ProtectedRouteProps) => {
    const { loading, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // This check is now effective. It will show the spinner on initial load
    // and wait until fetchCurrentUser is fulfilled or rejected.
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Not authenticated, redirect to login
    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated but hasn't completed onboarding
    if (requireOnboarding && user && (!user.skillsOffered?.length || !user.skillsWanted?.length || !user.availability?.length)) {
        return <Navigate to="/onboarding" replace />;
    }

    // Already authenticated, trying to access a public-only route (like login)
    if (!requireAuth && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};