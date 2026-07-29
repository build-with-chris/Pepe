import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  requiredRole?: string;
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { user, isLoaded, isSignedIn, profileLoaded } = useAuth();
  const location = useLocation();

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

  // `is_admin` und `guidelines_accepted` stammen aus der DB und stehen erst nach
  // dem Profil-Abruf fest. Vorher zu entscheiden hieße, jeden Admin einmal nach
  // /profile zu werfen und die Richtlinien-Weiche einmal falsch zu stellen.
  if (!profileLoaded) {
    return loader;
  }

  // Check admin role if required
  if (requiredRole === "admin" && !user?.is_admin) {
    return <Navigate to="/profile" replace />;
  }

  // For non-admin artist routes: require guidelines acceptance before accessing any page
  // Skip this check for the guidelines page itself and admin routes
  if (
    requiredRole !== "admin" &&
    !user?.is_admin &&
    user?.guidelines_accepted === false &&
    location.pathname !== "/richtlinien" &&
    location.pathname !== "/kuenstler-richtlinien" &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/artist-guidelines"
  ) {
    return <Navigate to="/kuenstler-richtlinien" replace />;
  }

  // Return children if provided, otherwise use Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
