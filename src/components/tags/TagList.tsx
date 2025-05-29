
import { TagListItem } from './TagListItem';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagListProps {
  availableTags: Tag[];
  onAddTag: (tagId: string) => void;
  onStartEdit: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
  editingTag: string | null;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const TagList = ({
  availableTags,
  onAddTag,
  onStartEdit,
  onDeleteTag,
  editingTag,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
}: TagListProps) => {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {availableTags.map((tag) => (
        <TagListItem
          key={tag.id}
          tag={tag}
          onAddTag={onAddTag}
          onStartEdit={onStartEdit}
          onDeleteTag={onDeleteTag}
          editingTag={editingTag}
          editingName={editingName}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </div>
  );
};
