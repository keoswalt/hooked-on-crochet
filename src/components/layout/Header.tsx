import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pencil, Palette, SwatchBook, Eclipse } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  userEmail?: string;
}

export const Header = ({ userEmail }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/planner');
  };

  const isProjectsActive = location.pathname.startsWith('/projects');
  const isStashActive = location.pathname.startsWith('/stash');
  const isSwatchesActive = location.pathname.startsWith('/swatches');

  const prefetchProjects = () => import('@/pages/ProjectListPage');
  const prefetchStash = () => {
    // no-op query prefetch for now
  };
  const prefetchSwatches = () => {
    import('@/pages/SwatchesPage');
  };

  return (
    // Use a wrapper div for full-width bg and border, then inner .container for content
    <div className="w-full border-b border-gray-200 bg-foreground">
      <div className="container mx-auto">
        <header className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Logo/Favicon and Title */}
            <div 
              className="flex items-center space-x-3 cursor-pointer transition-opacity"
              onClick={handleLogoClick}
            >
              <img 
                src="/hooked-on-crochet-favicon.svg" 
                alt="Hooked on Crochet" 
                className="h-8 w-8"
              />
              <h1 className="hidden hover:text-accent sm:block text-l font-bold text-white">
                Hooked on Crochet
              </h1>
            </div>
            
            {/* Navigation */}
            {userEmail && (
              <nav className="flex space-x-2">
                <Button
                  onMouseEnter={prefetchProjects}
                  variant={isProjectsActive ? "default" : "outline"}
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </Button>
                <Button
                  onMouseEnter={prefetchStash}
                  variant={isStashActive ? "default" : "outline"}
                  onClick={() => navigate('/stash')}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Stash</span>
                </Button>
                <Button
                  onMouseEnter={prefetchSwatches}
                  variant={isSwatchesActive ? "default" : "outline"}
                  onClick={() => navigate('/swatches')}
                  className="flex items-center gap-2"
                >
                  <SwatchBook className="h-4 w-4" />
                  <span className="hidden sm:inline">Swatches</span>
                </Button>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center pl-2">
            {userEmail && <UserMenu userEmail={userEmail} />}
          </div>
        </header>
      </div>
    </div>
  );
};
