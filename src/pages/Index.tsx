
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { ProjectListPage } from './ProjectListPage';
import ProjectDetailPage from './ProjectDetailPage';
import { PlannerPage } from './PlannerPage';
import PlannerDetailPage from './PlannerDetailPage';
import { StashPage } from './StashPage';
import { SwatchesPage } from './SwatchesPage';
import type { User } from '@supabase/supabase-js';
import { NavigationProvider } from "@/context/NavigationContext";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const { projectId, plannerId } = useParams();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentPage = () => {
    // Home should now be planner-list
    if (location.pathname === '/') {
      return 'planner-list';
    }
    if (location.pathname === '/projects') {
      return 'projects-list';
    }
    if (location.pathname.startsWith('/projects/') && projectId) {
      return 'projects-detail';
    }
    if (location.pathname === '/planner') {
      return 'planner-list';
    }
    if (location.pathname.startsWith('/planner/') && plannerId) {
      return 'planner-detail';
    }
    if (location.pathname === '/stash') {
      return 'stash';
    }
    if (location.pathname === '/swatches') {
      return 'swatches';
    }
    // Default to planner-list
    return 'planner-list';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white sm:bg-gray-800 flex flex-col">
  <Header />
  <div className="flex flex-1 justify-center items-center">
    <AuthForm mode={authMode} onModeChange={setAuthMode} />
  </div>
</div>

    );
  }

  const currentPage = getCurrentPage();

  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        {currentPage === 'projects-list' && (
          <ProjectListPage user={user} />
        )}
        {currentPage === 'projects-detail' && (
          <ProjectDetailPage user={user} />
        )}
        {currentPage === 'planner-list' && (
          <PlannerPage user={user} />
        )}
        {currentPage === 'planner-detail' && (
          <PlannerDetailPage user={user} />
        )}
        {currentPage === 'stash' && (
          <StashPage user={user} />
        )}
        {currentPage === 'swatches' && (
          <SwatchesPage user={user} />
        )}
      </div>
    </NavigationProvider>
  );
};

export default Index;
