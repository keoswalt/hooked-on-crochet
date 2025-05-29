
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableTags: Tag[];
  userTags: Tag[];
  onCreateTag: () => void;
}

export const TagSearchInput = ({
  searchTerm,
  onSearchChange,
  availableTags,
  userTags,
  onCreateTag,
}: TagSearchInputProps) => {
  const showCreateButton = searchTerm && 
    availableTags.length === 0 && 
    !userTags.some(t => t.name.toLowerCase() === searchTerm.toLowerCase());

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search tags or create new..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full text-sm"
      />

      {showCreateButton && (
        <Button
          onClick={onCreateTag}
          className="w-full justify-start text-sm"
          variant="outline"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-2" />
          Create "{searchTerm}"
        </Button>
      )}
    </div>
  );
};
