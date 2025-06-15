
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Palette, Grid3X3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  userEmail?: string;
}

export const Header = ({ userEmail }: HeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isPatternManager = location.pathname.startsWith('/projects') || location.pathname === '/';
  const isProjectPlanner = location.pathname.startsWith('/planner');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Hooked on Crochet</h1>
            </div>
            
            {userEmail && (
              <nav className="flex space-x-4">
                <Button
                  variant={isPatternManager ? "default" : "outline"}
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Pattern Manager
                </Button>
                <Button
                  variant={isProjectPlanner ? "default" : "outline"}
                  onClick={() => navigate('/planner')}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Project Planner
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {userEmail && (
              <>
                <span className="text-sm text-gray-600">{userEmail}</span>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
