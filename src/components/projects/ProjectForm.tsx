
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { TagManager } from '@/components/tags/TagManager';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onCancel: () => void;
  userId: string;
}

const hookSizes: HookSize[] = ['2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm', '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'];
const yarnWeights: YarnWeight[] = ['0', '1', '2', '3', '4', '5', '6', '7'];

export const ProjectForm = ({ project, onSave, onCancel, userId }: ProjectFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    hook_size: HookSize | '';
    yarn_weight: YarnWeight | '';
    details: string;
    featured_image_url: string | null;
  }>({
    name: '',
    hook_size: '',
    yarn_weight: '',
    details: '',
    featured_image_url: null,
  });

  const [showTagManager, setShowTagManager] = useState(false);
  const { deleteImage } = useImageOperations();
  const { projectTags, handleRemoveTag, refreshTags } = useProjectTags(project?.id || '', userId);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        hook_size: project.hook_size,
        yarn_weight: project.yarn_weight,
        details: project.details || '',
        featured_image_url: project.featured_image_url || null,
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.hook_size && formData.yarn_weight) {
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
    setFormData({ ...formData, featured_image_url: imageUrl });
  };

  const handleImageDelete = async () => {
    if (formData.featured_image_url) {
      const success = await deleteImage(formData.featured_image_url);
      if (success) {
        setFormData({ ...formData, featured_image_url: null });
      }
    }
  };

  const handleTagsChange = () => {
    // Just refresh the tags without saving the form
    refreshTags();
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>{project ? 'Edit Project' : 'New Project'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hook_size">Hook Size</Label>
              <Select value={formData.hook_size} onValueChange={(value: HookSize) => setFormData({ ...formData, hook_size: value })}>
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
              <Select value={formData.yarn_weight} onValueChange={(value: YarnWeight) => setFormData({ ...formData, yarn_weight: value })}>
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
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
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
                      onClick={() => setShowTagManager(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Tag
                    </Button>
                    
                    {showTagManager && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                        <div className="relative">
                          <TagManager
                            userId={userId}
                            projectId={project.id}
                            projectTags={projectTags}
                            onTagsChange={handleTagsChange}
                            isOpen={showTagManager}
                            onOpenChange={setShowTagManager}
                          />
                        </div>
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

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={!formData.hook_size || !formData.yarn_weight}>
                {project ? 'Update Project' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
