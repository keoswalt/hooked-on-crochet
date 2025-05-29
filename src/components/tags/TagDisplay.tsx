
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagDisplayProps {
  tags: Tag[];
  onRemove?: (tagId: string) => void;
  showRemove?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const TagDisplay = ({ tags, onRemove, showRemove = false, variant = 'secondary' }: TagDisplayProps) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag.id} variant={variant} className="text-xs">
          {tag.name}
          {showRemove && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag.id);
              }}
              className="ml-1 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
};
