
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagDisplayProps {
  entityId: string;
  entityType: 'pattern';
  userId: string;
  onTagsUpdate?: () => Promise<void>;
  readonly?: boolean;
}

export const TagDisplay = ({ 
  entityId,
  entityType,
  userId,
  onTagsUpdate,
  readonly = false
}: TagDisplayProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, [entityId, entityType]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pattern_tags')
        .select(`
          tag_id,
          tags (*)
        `)
        .eq('pattern_id', entityId);

      if (error) throw error;
      
      const fetchedTags = data?.map(pt => pt.tags).filter(Boolean) as Tag[] || [];
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (readonly) return;
    
    try {
      const { error } = await supabase
        .from('pattern_tags')
        .delete()
        .eq('pattern_id', entityId)
        .eq('tag_id', tagId);

      if (error) throw error;
      
      await fetchTags();
      if (onTagsUpdate) {
        await onTagsUpdate();
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  if (tags.length === 0) {
    return readonly ? null : <div className="text-sm text-gray-500">No tags</div>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
          <span>{tag.name}</span>
          {!readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag.id);
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
