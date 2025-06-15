
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { TagManager } from '@/components/tags/TagManager';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface PatternTagsSectionProps {
  patternId: string;
  userId: string;
  onTagsUpdate?: () => Promise<void>;
}

export const PatternTagsSection = ({ 
  patternId, 
  userId, 
  onTagsUpdate 
}: PatternTagsSectionProps) => {
  const [showTagManager, setShowTagManager] = useState(false);
  const [patternTags, setPatternTags] = useState<Tag[]>([]);

  const handleTagsChange = async () => {
    if (onTagsUpdate) {
      await onTagsUpdate();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex items-center gap-2 flex-wrap">
        <TagDisplay
          entityId={patternId}
          entityType="pattern"
          userId={userId}
          onTagsUpdate={onTagsUpdate}
          readonly={false}
        />
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTagManager(!showTagManager)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Tag
          </Button>
          
          {showTagManager && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <TagManager
                userId={userId}
                patternId={patternId}
                patternTags={patternTags}
                onTagsChange={handleTagsChange}
                isOpen={showTagManager}
                onOpenChange={setShowTagManager}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
