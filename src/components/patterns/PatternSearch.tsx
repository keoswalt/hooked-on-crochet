
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PatternSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PatternSearch = ({ searchTerm, onSearchChange }: PatternSearchProps) => {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search patterns..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
