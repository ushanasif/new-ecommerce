import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "owner" | "user"
  requireAuth?: boolean 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requireAuth = true 
}) => {
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth)

  // Show loading while checking auth
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (requireAuth) {
    // For routes that require authentication
    if (!token || !user) {
      return <Navigate to="/login" replace />
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  } else {
    // For routes that should redirect authenticated users (like login page)
    if (token && user) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute