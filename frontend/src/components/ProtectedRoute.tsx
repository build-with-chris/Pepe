import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  requiredRole?: string;
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { user, isLoaded, isSignedIn } = useAuth();

  // Show loader while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pepe-black)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role if required
  if (requiredRole === "admin") {
    const isAdmin = Boolean(user?.is_admin) || user?.role === "admin";
    if (!isAdmin) {
      return <Navigate to="/profile" replace />;
    }
  }

  // Return children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
