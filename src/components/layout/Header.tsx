import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Scissors } from 'lucide-react';
interface HeaderProps {
  userEmail?: string;
}
export const Header = ({
  userEmail
}: HeaderProps) => {
  const {
    toast
  } = useToast();
  const handleSignOut = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully."
      });
    }
  };
  const handleTitleClick = () => {
    window.location.href = '/';
  };
  return <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleTitleClick}>
          <img src='@/public/hooked-on-crochet-favicon.svg' className="h-6 w-6" />
          <h1 className="text-xl font-bold">Hooked on Crochet</h1>
        </div>
        {userEmail && <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:block">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-gray-900 bg-white border-white hover:bg-gray-100">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>}
      </div>
    </header>;
};
