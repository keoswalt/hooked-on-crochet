
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Check, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagListItemProps {
  tag: Tag;
  onAddTag: (tagId: string) => void;
  onStartEdit: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
  editingTag: string | null;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const TagListItem = ({
  tag,
  onAddTag,
  onStartEdit,
  onDeleteTag,
  editingTag,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
}: TagListItemProps) => {
  const isEditing = editingTag === tag.id;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSaveEdit();
    if (e.key === 'Escape') onCancelEdit();
  };

  return (
    <div className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded">
      {isEditing ? (
        <>
          <Input
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            className="flex-1 text-sm h-8"
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" onClick={onSaveEdit} className="h-8 w-8 p-0">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancelEdit} className="h-8 w-8 p-0">
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() => onAddTag(tag.id)}
            variant="ghost"
            className="flex-1 justify-start text-sm h-8 px-2"
          >
            {tag.name}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(tag)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteTag(tag)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
};
