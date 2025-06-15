
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

const HOOK_SIZES = [
  '1.5mm', '1.75mm', '2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm',
  '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'
];

interface SwatchFiltersProps {
  swatches: Swatch[];
  onFilter: (filteredSwatches: Swatch[]) => void;
  className?: string;
}

export const SwatchFilters = ({ swatches, onFilter, className }: SwatchFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hookSizeFilter, setHookSizeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let filtered = [...swatches];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(swatch =>
        swatch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        swatch.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        swatch.yarn_used?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply hook size filter
    if (hookSizeFilter) {
      filtered = filtered.filter(swatch => swatch.hook_size === hookSizeFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'hook_size':
        filtered.sort((a, b) => {
          if (!a.hook_size) return 1;
          if (!b.hook_size) return -1;
          return a.hook_size.localeCompare(b.hook_size);
        });
        break;
    }

    onFilter(filtered);
  }, [swatches, searchTerm, hookSizeFilter, sortBy, onFilter]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search swatches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Hook Size Filter */}
        <Select value={hookSizeFilter} onValueChange={setHookSizeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Hook Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sizes</SelectItem>
            {HOOK_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">By Title</SelectItem>
            <SelectItem value="hook_size">By Hook Size</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
