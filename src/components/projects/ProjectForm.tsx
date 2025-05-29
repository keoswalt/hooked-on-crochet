import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { TagManager } from '@/components/tags/TagManager';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface FormData {
  name: string;
  hook_size: HookSize | '';
  yarn_weight: YarnWeight | '';
  details: string;
  featured_image_url: string | null;
}

interface ProjectFormProps {
  project?: Project;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  userId: string;
  showButtons?: boolean;
  onSave?: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onCancel?: () => void;
  onRefreshProjects?: () => void;
}

const hookSizes: HookSize[] = ['2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm', '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'];
const yarnWeights: YarnWeight[] = ['0', '1', '2', '3', '4', '5', '6', '7'];

export const ProjectForm = ({ 
  project, 
  formData,
  onFormDataChange,
  userId,
  showButtons = true,
  onSave,
  onCancel,
  onRefreshProjects
}: ProjectFormProps) => {
  const [showTagManager, setShowTagManager] = useState(false);
  const { deleteImage } = useImageOperations();
  const { projectTags, handleRemoveTag, refreshTags } = useProjectTags(project?.id || '', userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave && formData.hook_size && formData.yarn_weight) {
      onSave({
        name: formData.name,
        hook_size: formData.hook_size,
        yarn_weight: formData.yarn_weight,
        details: formData.details || null,
        featured_image_url: formData.featured_image_url,
        is_favorite: project?.is_favorite || false,
        last_mode: project?.last_mode || 'edit',
      });
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    onFormDataChange({ ...formData, featured_image_url: imageUrl });
  };

  const handleImageDelete = async () => {
    if (formData.featured_image_url) {
      const success = await deleteImage(formData.featured_image_url);
      if (success) {
        onFormDataChange({ ...formData, featured_image_url: null });
      }
    }
  };

  const handleTagsChange = () => {
    refreshTags();
    // Refresh the project list to show updated tags
    if (onRefreshProjects) {
      onRefreshProjects();
    }
    // Trigger parent component to refresh tags as well
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('tagsUpdated'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hook_size">Hook Size</Label>
        <Select value={formData.hook_size} onValueChange={(value: HookSize) => onFormDataChange({ ...formData, hook_size: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select hook size" />
          </SelectTrigger>
          <SelectContent>
            {hookSizes.map((size) => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yarn_weight">Yarn Weight</Label>
        <Select value={formData.yarn_weight} onValueChange={(value: YarnWeight) => onFormDataChange({ ...formData, yarn_weight: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select yarn weight" />
          </SelectTrigger>
          <SelectContent>
            {yarnWeights.map((weight) => (
              <SelectItem key={weight} value={weight}>{weight}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <textarea
          id="details"
          value={formData.details}
          onChange={(e) => onFormDataChange({ ...formData, details: e.target.value })}
          className="w-full p-2 border rounded-md min-h-[100px] resize-none"
          placeholder="Add project details, notes, or pattern information..."
        />
      </div>

      {project && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <TagDisplay 
              tags={projectTags} 
              onRemoveTag={handleRemoveTag}
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
                    projectId={project.id}
                    projectTags={projectTags}
                    onTagsChange={handleTagsChange}
                    isOpen={showTagManager}
                    onOpenChange={setShowTagManager}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Featured Image</Label>
        {formData.featured_image_url ? (
          <ImageViewer
            imageUrl={formData.featured_image_url}
            alt="Project featured image"
            className="w-full h-32"
            onDelete={handleImageDelete}
          />
        ) : (
          <ImageUploader
            onImageUploaded={handleImageUpload}
            userId={userId}
            folder="featured"
            className="w-full"
          />
        )}
      </div>

      {showButtons && (
        <div className="flex space-x-2">
          <Button type="submit" className="flex-1" disabled={!formData.hook_size || !formData.yarn_weight}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
};
