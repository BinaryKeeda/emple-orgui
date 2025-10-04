import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'


export const UserRoute = () => {
  const { user } = useSelector((s: RootState) => s.auth)

  if (user) {
    if (user.user.role === "campus-admin") {
      return <Navigate to={`/dashboard/`} replace />
    }

    if (user.user.role === "campus-superadmin") {
      return <Navigate to="/dashboard" replace />
    }

    if (user.user.role === "user" || user.user.role === "admin") {
      window.location.href = `https://binarykeeda.com/${user.user.role}`
      return null
    }
  }

  // ✅ If no user → show login page
  return <Outlet/>
}


interface RoleBasedRouteProps {
  requiredRole: string[]
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ requiredRole }) => {
  const { user } = useSelector((s: RootState) => s.auth)

  if (!user) return <Navigate to="/" replace />

  // ✅ If role is allowed, render route
  if (requiredRole.includes(user.user.role)) {
    return <Outlet />
  }

  // 🚀 Role-specific fallbacks ONLY if not authorized
  if (user.user.role === "user" || user.user.role === "admin") {
    window.location.href = `https://binarykeeda.com/${user.user.role}`
    return null
  }

  if (user.user.role === "campus-admin") {
    // fallback to their section home
    return <Navigate to={`/dashboard/`} replace />
  }

  if (user.user.role === "campus-superadmin") {
    // fallback to main dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/" replace />
}
