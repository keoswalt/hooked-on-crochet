
import { useMemo } from 'react';
import { PatternSearch } from './PatternSearch';
import { PatternGrid } from './PatternGrid';
import { PatternImporter } from './PatternImporter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTagOperations } from '@/hooks/useTagOperations';
import { useEffect, useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

interface PatternListViewProps {
  patterns: Pattern[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditPattern: (pattern: Pattern) => void;
  onDeletePattern: (id: string) => void;
  onDuplicatePattern: (pattern: Pattern) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardClick: (pattern: Pattern) => void;
  onCreatePattern: () => void;
  onImportPattern: (file: File) => void;
  operationsLoading: boolean;
  userId: string;
}

export const PatternListView = ({
  patterns,
  searchTerm,
  onSearchChange,
  onEditPattern,
  onDeletePattern,
  onDuplicatePattern,
  onToggleFavorite,
  onCardClick,
  onCreatePattern,
  onImportPattern,
  operationsLoading,
  userId,
}: PatternListViewProps) => {
  const [patternTags, setPatternTags] = useState<Record<string, Tag[]>>({});
  const [tagsRefreshTrigger, setTagsRefreshTrigger] = useState(0);
  const { fetchProjectTags } = useTagOperations(userId);

  // Load tags for all patterns
  useEffect(() => {
    const loadAllPatternTags = async () => {
      const tagsMap: Record<string, Tag[]> = {};
      
      for (const pattern of patterns) {
        const tags = await fetchProjectTags(pattern.id);
        tagsMap[pattern.id] = tags;
      }
      
      setPatternTags(tagsMap);
    };

    if (patterns.length > 0) {
      loadAllPatternTags();
    }
  }, [patterns, fetchProjectTags, tagsRefreshTrigger]);

  // Filter patterns based on search term (patterns are already sorted by database)
  const filteredPatterns = useMemo(() => {
    if (!searchTerm.trim()) {
      return patterns;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return patterns.filter(pattern => {
      // Search in pattern name
      const nameMatch = pattern.name.toLowerCase().includes(lowercaseSearch);
      
      // Search in pattern tags
      const tags = patternTags[pattern.id] || [];
      const tagMatch = tags.some(tag => 
        tag.name.toLowerCase().includes(lowercaseSearch)
      );
      
      return nameMatch || tagMatch;
    });
  }, [patterns, searchTerm, patternTags]);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleTagsUpdate = () => {
    console.log('handleTagsUpdate called in PatternListView');
    setTagsRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Crochet Patterns</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <PatternSearch 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
          <div className="flex gap-2">
            <PatternImporter 
              onImport={onImportPattern}
              loading={operationsLoading}
            />
            <Button onClick={onCreatePattern} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              New Pattern
            </Button>
          </div>
        </div>
      </div>

      <PatternGrid
        patterns={filteredPatterns}
        searchTerm={searchTerm}
        onEditPattern={onEditPattern}
        onDeletePattern={onDeletePattern}
        onDuplicatePattern={onDuplicatePattern}
        onToggleFavorite={onToggleFavorite}
        onCardClick={onCardClick}
        onCreatePattern={onCreatePattern}
        onClearSearch={handleClearSearch}
        onTagsUpdate={handleTagsUpdate}
        userId={userId}
      />
    </div>
  );
};
