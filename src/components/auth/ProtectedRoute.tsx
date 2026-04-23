import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth, AppRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoles?: AppRole[];
}

export function ProtectedRoute({ children, requireRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (requireRoles && role && !requireRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
