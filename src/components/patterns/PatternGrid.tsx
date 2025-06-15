
import { PatternCard } from './PatternCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternGridProps {
  patterns: Pattern[];
  searchTerm: string;
  onEditPattern: (pattern: Pattern) => void;
  onDeletePattern: (id: string) => void;
  onDuplicatePattern: (pattern: Pattern) => Promise<void>;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
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
  const handleDeletePattern = async (id: string) => {
    onDeletePattern(id);
  };

  const handleDuplicatePattern = async (pattern: Pattern) => {
    await onDuplicatePattern(pattern);
  };

  if (patterns.length === 0) {
    if (searchTerm) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patterns found</h3>
          <p className="text-gray-500 mb-4">
            No patterns match your search for "{searchTerm}"
          </p>
          <Button onClick={onClearSearch} variant="outline">
            Clear search
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No patterns yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first crochet pattern
        </p>
        <Button onClick={onCreatePattern}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Pattern
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patterns.map((pattern) => (
        <PatternCard
          key={pattern.id}
          pattern={pattern}
          onEdit={onEditPattern}
          onDelete={handleDeletePattern}
          onDuplicate={handleDuplicatePattern}
          onToggleFavorite={onToggleFavorite}
          onCardClick={onCardClick}
          userId={userId}
        />
      ))}
    </div>
  );
};
