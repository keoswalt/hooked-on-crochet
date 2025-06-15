
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { ProjectListPage } from './ProjectListPage';
import { ProjectDetailPage } from './ProjectDetailPage';
import type { User } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { projectId } = useParams();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentPage = () => {
    if (location.pathname === '/') {
      return 'list';
    }
    if (location.pathname === '/projects') {
      return 'list';
    }
    if (location.pathname.startsWith('/projects/') && projectId) {
      return 'detail';
    }
    return 'list';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AuthForm />
      </div>
    );
  }

  const currentPage = getCurrentPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />
      {currentPage === 'list' ? (
        <ProjectListPage user={user} />
      ) : (
        <ProjectDetailPage user={user} />
      )}
    </div>
  );
};

export default Index;
