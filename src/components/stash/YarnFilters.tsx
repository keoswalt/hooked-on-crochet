
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface YarnFiltersProps {
  yarns: YarnStash[];
  onFilter: (filteredYarns: YarnStash[]) => void;
  className?: string;
}

export const YarnFilters = ({ yarns, onFilter, className }: YarnFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Get unique brands and weights from yarns
  const brands = Array.from(new Set(yarns.map(y => y.brand).filter(Boolean))).sort();
  const weights = Array.from(new Set(yarns.map(y => y.weight).filter(Boolean))).sort();

  useEffect(() => {
    let filtered = [...yarns];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(yarn =>
        yarn.name.toLowerCase().includes(term) ||
        yarn.brand?.toLowerCase().includes(term) ||
        yarn.color?.toLowerCase().includes(term) ||
        yarn.material?.toLowerCase().includes(term)
      );
    }

    // Brand filter
    if (selectedBrand && selectedBrand !== 'all') {
      filtered = filtered.filter(yarn => yarn.brand === selectedBrand);
    }

    // Weight filter
    if (selectedWeight && selectedWeight !== 'all') {
      filtered = filtered.filter(yarn => yarn.weight === selectedWeight);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '');
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'remaining_yardage':
          return (b.remaining_yardage || 0) - (a.remaining_yardage || 0);
        default:
          return 0;
      }
    });

    onFilter(filtered);
  }, [yarns, searchTerm, selectedBrand, selectedWeight, sortBy, onFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedWeight('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedBrand !== 'all' || selectedWeight !== 'all' || sortBy !== 'name';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search yarn name, brand, color, or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="brand">Brand (A-Z)</SelectItem>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="remaining_yardage">Most Remaining</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {brands.length > 0 && (
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand!}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {weights.length > 0 && (
            <Select value={selectedWeight} onValueChange={setSelectedWeight}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All weights" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All weights</SelectItem>
                {weights.map((weight) => (
                  <SelectItem key={weight} value={weight!}>
                    {getYarnWeightLabel(weight)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchTerm('')}
              />
            </Badge>
          )}
          {selectedBrand && selectedBrand !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Brand: {selectedBrand}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedBrand('all')}
              />
            </Badge>
          )}
          {selectedWeight && selectedWeight !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Weight: {getYarnWeightLabel(selectedWeight)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedWeight('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
