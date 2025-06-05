
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBasicFields } from './ProjectBasicFields';
import { ProjectDetailsField } from './ProjectDetailsField';
import { ProjectTagsSection } from './ProjectTagsSection';
import { ProjectImageSection } from './ProjectImageSection';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
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
  const { deleteImage } = useImageOperations();
  // Only call useProjectTags if we have a valid project ID
  const { projectTags, handleRemoveTag, refreshTags } = useProjectTags(
    project?.id || '', 
    userId
  );

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
        status: project?.status || null,
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
    console.log('Tags changed in ProjectForm');
    refreshTags();
    
    // Refresh the project list to show updated tags
    if (onRefreshProjects) {
      onRefreshProjects();
    }
    
    // Dispatch events to notify other components
    window.dispatchEvent(new CustomEvent('tagsUpdated', { 
      detail: { projectId: project?.id } 
    }));
    window.dispatchEvent(new CustomEvent('projectTagsUpdated', { 
      detail: { projectId: project?.id } 
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProjectBasicFields 
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <ProjectDetailsField 
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      {project && (
        <ProjectTagsSection 
          project={project}
          userId={userId}
          projectTags={projectTags}
          onRemoveTag={handleRemoveTag}
          onTagsChange={handleTagsChange}
        />
      )}

      <ProjectImageSection 
        formData={formData}
        onFormDataChange={onFormDataChange}
        userId={userId}
        onImageDelete={handleImageDelete}
        onImageUpload={handleImageUpload}
      />

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
