import { Navigate, Outlet } from "react-router-dom";
import { LOGIN_URL } from "../config/config";
import { useUser } from "../context/UserContext";

export const UserRoute = () => {
  const { user, isFetchingUser } = useUser();
  if (isFetchingUser) return <>loading...</>
  if (!user) {
    return <Navigate to={LOGIN_URL} />;
  }
  if (user) {
    if (user.role === "campus-admin") {
      return <Navigate to={`/dashboard/`} replace />;
    }

    if (user.role === "campus-superadmin") {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "user" || user.role === "admin") {
      window.location.href = `https://binarykeeda.com/${user.role}`;
      return null;
    }
  }

  // ✅ If no user → show login page
  return <Outlet />;
};

interface RoleBasedRouteProps {
  requiredRole: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  requiredRole,
}) => {
  const { user  , isFetchingUser} = useUser();

  if(isFetchingUser) return <></>

  if (!user) return <Navigate to="/" replace />;

  // ✅ If role is allowed, render route
  if (requiredRole.includes(user.role)) {
    return <Outlet />;
  }

  // 🚀 Role-specific fallbacks ONLY if not authorized
  if (user.role === "user" || user.role === "admin") {
    window.location.href = `https://binarykeeda.com/${user.role}`;
    return null;
  }

  if (user.role === "campus-admin") {
    // fallback to their section home
    return <Navigate to={`/dashboard/`} replace />;
  }

  if (user.role === "campus-superadmin") {
    // fallback to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};
