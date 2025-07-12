import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from './ui/loading-spinner'
import { useAppSelector } from '@/hooks/reduxHooks'

interface ProtectedRouteProps {
	children: React.ReactNode
	requireAuth?: boolean
	requireOnboarding?: boolean
}

export const ProtectedRoute = ({
	children,
	requireAuth = true,
	requireOnboarding = false,
}: ProtectedRouteProps) => {
	const { loading, user } = useAppSelector((state) => state.auth);
	const location = useLocation()

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		)
	}

	// Not authenticated, redirect to login
	if (requireAuth && !user) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	// Authenticated but hasn't completed onboarding
	if (requireOnboarding && user && (!user.skillsOffered || !user.skillsWanted || !user.availability )) {
		return <Navigate to="/onboarding" replace />
	}

	// Already authenticated, redirect to dashboard
	if (!requireAuth && user) {
		return <Navigate to="/dashboard" replace />
	}

	return <>{children}</>
} 