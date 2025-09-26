import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ requiredRole }: { requiredRole?: string }) {
  const { user, token } = useAuth();
  const loading = user === null && token === null;
  if (loading) return null; // or a loader/spinner
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const isAdmin = Boolean(user.is_admin) || user.role === "admin";
    if (requiredRole === "admin" && !isAdmin) {
      return <Navigate to="/not-authorized" replace />;
    }
    if (requiredRole !== "admin" && user.role !== requiredRole) {
      return <Navigate to="/not-authorized" replace />;
    }
  }
  return <Outlet />;
}