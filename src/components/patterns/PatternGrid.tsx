
import { PatternCard } from './PatternCard';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternGridProps {
  patterns: Pattern[];
  searchTerm: string;
  onEditPattern: (pattern: Pattern) => void;
  onDeletePattern: (id: string) => void;
  onDuplicatePattern: (pattern: Pattern) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardClick: (pattern: Pattern) => void;
  onCreatePattern: () => void;
  onClearSearch: () => void;
  onTagsUpdate: () => void;
  userId: string;
}

export const PatternGrid = ({
  patterns,
  searchTerm,
  onEditPattern,
  onDeletePattern,
  onDuplicatePattern,
  onToggleFavorite,
  onCardClick,
  onCreatePattern,
  onClearSearch,
  onTagsUpdate,
  userId,
}: PatternGridProps) => {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        {searchTerm ? (
          <div className="space-y-4">
            <p className="text-gray-500">No patterns found matching "{searchTerm}"</p>
            <Button variant="outline" onClick={onClearSearch}>
              <X className="h-4 w-4 mr-2" />
              Clear search
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500">No patterns yet. Create your first pattern to get started!</p>
            <Button onClick={onCreatePattern}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Pattern
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {patterns.map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onEdit={() => onEditPattern(pattern)}
          onDelete={() => onDeletePattern(pattern.id)}
          onDuplicate={() => onDuplicatePattern(pattern)}
          onToggleFavorite={() => onToggleFavorite(pattern.id, pattern.is_favorite)}
          onClick={() => onCardClick(pattern)}
          onTagsUpdate={onTagsUpdate}
          userId={userId}
        />
      ))}
    </div>
  );
};
