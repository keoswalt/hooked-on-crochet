
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TagSearchInput } from './TagSearchInput';
import { TagList } from './TagList';
import { TagDeleteConfirmationDialog } from './TagDeleteConfirmationDialog';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userTags: Tag[];
  projectTags: Tag[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateTag: () => void;
  onAddTag: (tagId: string) => void;
  onStartEdit: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
  editingTag: string | null;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  deleteConfirmTag: Tag | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export const TagManagerDialog = ({
  isOpen,
  onOpenChange,
  userTags,
  projectTags,
  searchTerm,
  onSearchChange,
  onCreateTag,
  onAddTag,
  onStartEdit,
  onDeleteTag,
  editingTag,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
  deleteConfirmTag,
  onConfirmDelete,
  onCancelDelete,
}: TagManagerDialogProps) => {
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('[data-tag-manager]')) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const filteredTags = userTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTags = filteredTags.filter(tag =>
    !projectTags.some(pt => pt.id === tag.id)
  );

  if (!isOpen) return null;

  return (
    <div 
      data-tag-manager
      className="border rounded-lg p-3 bg-white shadow-lg w-56 z-50"
    >
      <div className="space-y-3">
        <TagSearchInput
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          availableTags={availableTags}
          userTags={userTags}
          onCreateTag={onCreateTag}
        />

        <TagList
          availableTags={availableTags}
          onAddTag={onAddTag}
          onStartEdit={onStartEdit}
          onDeleteTag={onDeleteTag}
          editingTag={editingTag}
          editingName={editingName}
          onEditingNameChange={onEditingNameChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />

        <Button
          onClick={() => onOpenChange(false)}
          variant="outline"
          className="w-full text-sm"
          size="sm"
        >
          Done
        </Button>
      </div>

      <TagDeleteConfirmationDialog
        tag={deleteConfirmTag}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
};
