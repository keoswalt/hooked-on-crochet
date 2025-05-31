
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { Header } from '@/components/layout/Header';
import type { User } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">

        <AuthForm mode={authMode} onModeChange={setAuthMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />
      <main className="container mx-auto px-4 py-8">
        <ProjectsPage user={user} />
      </main>
    </div>
  );
};

export default Index;
