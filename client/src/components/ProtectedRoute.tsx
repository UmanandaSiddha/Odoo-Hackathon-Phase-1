import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { LoadingSpinner } from './ui/loading-spinner'

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
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
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
  if (requireOnboarding && user && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  // Already authenticated, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
} 