
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagInput } from '@/components/tags/TagInput';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useTagOperations } from '@/hooks/useTagOperations';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];
type Tag = Database['public']['Tables']['tags']['Row'];

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

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { deleteImage } = useImageOperations();
  const { fetchProjectTags } = useTagOperations(userId);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        hook_size: project.hook_size,
        yarn_weight: project.yarn_weight,
        details: project.details || '',
        featured_image_url: project.featured_image_url || null,
      });
      
      // Load project tags
      loadProjectTags();
    }
  }, [project]);

  const loadProjectTags = async () => {
    if (project) {
      const tags = await fetchProjectTags(project.id);
      setSelectedTags(tags);
    }
  };

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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{project ? 'Edit Project' : 'New Project'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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

          <TagInput
            projectId={project?.id}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            userId={userId}
          />

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
  );
};
