
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Pencil } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  userEmail?: string;
}

export const Header = ({ userEmail }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/projects');
  };

  const isProjectsActive = location.pathname.startsWith('/projects') || location.pathname === '/';
  const isPlannerActive = location.pathname.startsWith('/planner');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo/Favicon and Title */}
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <img 
                src="/hooked-on-crochet-favicon.svg" 
                alt="Hooked on Crochet" 
                className="h-8 w-8"
              />
              <h1 className="hidden sm:block text-xl font-bold text-gray-900">
                Hooked on Crochet
              </h1>
            </div>
            
            {/* Navigation */}
            {userEmail && (
              <nav className="flex space-x-4">
                <Button
                  variant={isProjectsActive ? "default" : "outline"}
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </Button>
                <Button
                  variant={isPlannerActive ? "default" : "outline"}
                  onClick={() => navigate('/planner')}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Plans</span>
                </Button>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {userEmail && <UserMenu userEmail={userEmail} />}
          </div>
        </div>
      </div>
    </header>
  );
};
