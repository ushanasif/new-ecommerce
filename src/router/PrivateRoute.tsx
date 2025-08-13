import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  // Optional: Prevent logged-in users from visiting login/register
  useEffect(() => {
    if (token && ["/login", "/register"].includes(location.pathname)) {
      window.location.href = "/";
    }
  }, [location.pathname, token]);

  if (!token) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect unauthorized users
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
