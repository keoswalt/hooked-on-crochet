import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";

interface RequireAuthProps {
  component: React.ComponentType<any>;
}

export const RequireAuth = ({ component: Component }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth is determining, keep current UI (no flash)
  if (loading) return null;

  // If no user, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <>
      <Header userEmail={user.email} />
      <Component user={user} />
    </>
  );
}; 