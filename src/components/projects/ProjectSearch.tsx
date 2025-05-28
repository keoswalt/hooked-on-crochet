
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProjectSearch = ({ searchTerm, onSearchChange }: ProjectSearchProps) => {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
