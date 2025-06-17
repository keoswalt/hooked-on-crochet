import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>("signin");

  // If authentication state is resolved and user is present, redirect to planner
  if (!loading && user) {
    return <Navigate to="/planner" replace />;
  }

  return (
    <div className="min-h-screen bg-white sm:bg-primary flex flex-col">
      <Header />
      <div className="flex flex-1 justify-center items-center">
        <AuthForm mode={authMode} onModeChange={setAuthMode} />
      </div>
    </div>
  );
};

export default AuthPage; 