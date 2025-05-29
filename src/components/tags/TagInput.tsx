
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Tag } from 'lucide-react';
import { TagDisplay } from './TagDisplay';
import { useTagOperations } from '@/hooks/useTagOperations';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagInputProps {
  projectId?: string;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  userId: string;
}

export const TagInput = ({ projectId, selectedTags, onTagsChange, userId }: TagInputProps) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);

  const { fetchTags, createTag, addTagToProject, removeTagFromProject } = useTagOperations(userId);

  useEffect(() => {
    loadAvailableTags();
  }, []);

  useEffect(() => {
    if (inputValue) {
      const filtered = availableTags.filter(tag => 
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.some(selected => selected.id === tag.id)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [inputValue, availableTags, selectedTags]);

  const loadAvailableTags = async () => {
    const tags = await fetchTags();
    setAvailableTags(tags);
  };

  const handleAddTag = async (tag?: Tag) => {
    let tagToAdd = tag;

    if (!tagToAdd && inputValue.trim()) {
      // Create new tag
      const existingTag = availableTags.find(t => t.name.toLowerCase() === inputValue.toLowerCase());
      if (existingTag) {
        tagToAdd = existingTag;
      } else {
        tagToAdd = await createTag(inputValue.trim());
        if (tagToAdd) {
          setAvailableTags(prev => [...prev, tagToAdd!]);
        }
      }
    }

    if (tagToAdd && !selectedTags.some(selected => selected.id === tagToAdd!.id)) {
      const newTags = [...selectedTags, tagToAdd];
      onTagsChange(newTags);
      
      if (projectId) {
        await addTagToProject(projectId, tagToAdd.id);
      }
    }

    setInputValue('');
    setShowInput(false);
  };

  const handleRemoveTag = async (tagId: string) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(newTags);
    
    if (projectId) {
      await removeTagFromProject(projectId, tagId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      
      <TagDisplay 
        tags={selectedTags} 
        onRemove={handleRemoveTag}
        showRemove={true}
      />

      {showInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type tag name..."
              className="flex-1"
              autoFocus
            />
            <Button 
              type="button" 
              onClick={() => handleAddTag()}
              disabled={!inputValue.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {filteredTags.length > 0 && (
            <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowInput(true)}
          className="w-full"
        >
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      )}
    </div>
  );
};
