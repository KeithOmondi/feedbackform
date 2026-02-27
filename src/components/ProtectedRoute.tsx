import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  adminOnly?: boolean; // <-- added adminOnly prop
}

const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
  const { token, user } = useAppSelector((state) => state.auth);

  // Not logged in
  if (!token) return <Navigate to="/" replace />;

  // Check admin access if required
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
