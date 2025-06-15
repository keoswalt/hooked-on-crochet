
import { TagDisplay } from '@/components/tags/TagDisplay';

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
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <TagDisplay
        entityId={patternId}
        entityType="pattern"
        userId={userId}
        onTagsUpdate={onTagsUpdate}
        readonly={false}
      />
    </div>
  );
};
