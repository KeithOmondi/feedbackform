import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
  const { token, user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 1. Prevent "Flash" of login screen while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. User is not logged in at all
  if (!token) {
    // Redirect to login, but save the current location so we can redirect back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Admin access required but user is just a standard "user"
  if (adminOnly && user?.role !== "admin") {
    // Better to send them to a "not authorized" page or the user dashboard
    // than back to the login screen, which can be confusing.
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Authorized - Render the protected content
  return children;
};

export default ProtectedRoute;