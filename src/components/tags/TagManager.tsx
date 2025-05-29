
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { TagDeleteConfirmationDialog } from './TagDeleteConfirmationDialog';
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
    removeTagFromProject,
    getTagUsageCount,
  } = useTagOperations(userId);

  useEffect(() => {
    if (isOpen) {
      loadUserTags();
    }
  }, [isOpen]);

  const loadUserTags = async () => {
    const tags = await fetchUserTags();
    setUserTags(tags);
  };

  const filteredTags = userTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTags = filteredTags.filter(tag =>
    !projectTags.some(pt => pt.id === tag.id)
  );

  const handleCreateTag = async () => {
    if (searchTerm.trim()) {
      const newTag = await createTag(searchTerm.trim());
      if (newTag) {
        await addTagToProject(projectId, newTag.id);
        setSearchTerm('');
        onTagsChange();
        loadUserTags();
      }
    }
  };

  const handleAddTag = async (tagId: string) => {
    const success = await addTagToProject(projectId, tagId);
    if (success) {
      onTagsChange();
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

  if (!isOpen) return null;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-lg">
      <div className="space-y-3">
        <Input
          placeholder="Search tags or create new..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        {searchTerm && availableTags.length === 0 && !userTags.some(t => t.name.toLowerCase() === searchTerm.toLowerCase()) && (
          <Button
            onClick={handleCreateTag}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create "{searchTerm}"
          </Button>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {availableTags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
              {editingTag === tag.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleAddTag(tag.id)}
                    variant="ghost"
                    className="flex-1 justify-start"
                  >
                    {tag.name}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTag(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          variant="outline"
          className="w-full"
        >
          Done
        </Button>
      </div>

      <TagDeleteConfirmationDialog
        tag={deleteConfirmTag}
        onConfirm={confirmDeleteTag}
        onCancel={() => setDeleteConfirmTag(null)}
      />
    </div>
  );
};
