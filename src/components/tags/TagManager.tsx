
import { useState, useEffect } from 'react';
import { TagManagerDialog } from './TagManagerDialog';
import { useTagOperations } from '@/hooks/useTagOperations';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagManagerProps {
  userId: string;
  projectId: string;
  projectTags: Tag[];
  onTagsChange: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TagManager = ({
  userId,
  projectId,
  projectTags,
  onTagsChange,
  isOpen,
  onOpenChange,
}: TagManagerProps) => {
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null);
  
  const {
    fetchUserTags,
    createTag,
    updateTag,
    deleteTag,
    addTagToProject,
    getTagUsageCount,
  } = useTagOperations(userId);

  useEffect(() => {
    if (isOpen) {
      loadUserTags();
    }
  }, [isOpen]);

  const loadUserTags = async () => {
    const tags = await fetchUserTags();
    // Sort tags alphabetically by name
    const sortedTags = tags.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    setUserTags(sortedTags);
  };

  const handleCreateTag = async () => {
    if (searchTerm.trim()) {
      const newTag = await createTag(searchTerm.trim());
      if (newTag) {
        await addTagToProject(projectId, newTag.id);
        setSearchTerm('');
        onTagsChange();
        loadUserTags();
        // Close the menu after creating and adding the tag
        onOpenChange(false);
      }
    }
  };

  const handleAddTag = async (tagId: string) => {
    const success = await addTagToProject(projectId, tagId);
    if (success) {
      onTagsChange();
      // Close the menu after successfully adding the tag
      onOpenChange(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditingName(tag.name);
  };

  const handleSaveEdit = async () => {
    if (editingTag && editingName.trim()) {
      const success = await updateTag(editingTag, editingName.trim());
      if (success) {
        setEditingTag(null);
        setEditingName('');
        loadUserTags();
        onTagsChange();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditingName('');
  };

  const handleDeleteTag = async (tag: Tag) => {
    const usageCount = await getTagUsageCount(tag.id);
    setDeleteConfirmTag({ ...tag, usageCount } as Tag & { usageCount: number });
  };

  const confirmDeleteTag = async () => {
    if (deleteConfirmTag) {
      const success = await deleteTag(deleteConfirmTag.id);
      if (success) {
        loadUserTags();
        onTagsChange();
      }
      setDeleteConfirmTag(null);
    }
  };

  return (
    <TagManagerDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      userTags={userTags}
      projectTags={projectTags}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onCreateTag={handleCreateTag}
      onAddTag={handleAddTag}
      onStartEdit={handleStartEdit}
      onDeleteTag={handleDeleteTag}
      editingTag={editingTag}
      editingName={editingName}
      onEditingNameChange={setEditingName}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      deleteConfirmTag={deleteConfirmTag}
      onConfirmDelete={confirmDeleteTag}
      onCancelDelete={() => setDeleteConfirmTag(null)}
    />
  );
};
