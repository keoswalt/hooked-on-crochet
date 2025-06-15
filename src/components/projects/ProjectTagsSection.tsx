
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { TagManager } from '@/components/tags/TagManager';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['patterns']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

interface ProjectTagsSectionProps {
  project: Project | undefined;
  userId: string;
  projectTags: Tag[];
  onRemoveTag: (tagId: string) => void;
  onTagsChange: () => void;
}

export const ProjectTagsSection = ({ 
  project, 
  userId, 
  projectTags, 
  onRemoveTag, 
  onTagsChange 
}: ProjectTagsSectionProps) => {
  const [showTagManager, setShowTagManager] = useState(false);

  if (!project) return null;

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex items-center gap-2 flex-wrap">
        <TagDisplay 
          entityId={project.id}
          entityType="pattern"
          userId={userId}
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
                patternId={project.id}
                patternTags={projectTags}
                onTagsChange={onTagsChange}
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
