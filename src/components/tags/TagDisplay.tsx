
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagDisplayProps {
  tags: Tag[];
  onRemoveTag?: (tagId: string) => void;
  showRemoveButton?: boolean;
  size?: 'sm' | 'default';
}

export const TagDisplay = ({ 
  tags, 
  onRemoveTag, 
  showRemoveButton = true,
  size = 'default'
}: TagDisplayProps) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="outline" className={`${size === 'sm' ? 'text-xs px-2 py-0.5' : ''} flex items-center gap-1`}>
          <span>{tag.name}</span>
          {showRemoveButton && onRemoveTag && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      ))}
    </div>
  );
};
