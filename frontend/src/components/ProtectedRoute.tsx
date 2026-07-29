import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  requiredRole?: string;
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { user, isLoaded, isSignedIn, profileLoaded } = useAuth();

  const loader = (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--pepe-black)' }}>
      <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
    </div>
  );

  // Show loader while Clerk is loading
  if (!isLoaded) {
    return loader;
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role if required
  if (requiredRole === "admin") {
    // `is_admin` stammt aus der DB und steht erst nach dem Profil-Abruf fest.
    // Vorher zu entscheiden hieße, jeden Admin einmal nach /profile zu werfen.
    if (!profileLoaded) {
      return loader;
    }
    if (!user?.is_admin) {
      return <Navigate to="/profile" replace />;
    }
  }

  // Return children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
