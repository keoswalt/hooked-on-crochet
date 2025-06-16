import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AuthForm } from "@/components/auth/AuthForm";

const AuthPage = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-white sm:bg-gray-800 flex flex-col">
      <Header />
      <div className="flex flex-1 justify-center items-center">
        <AuthForm mode={authMode} onModeChange={setAuthMode} />
      </div>
    </div>
  );
};

export default AuthPage; 