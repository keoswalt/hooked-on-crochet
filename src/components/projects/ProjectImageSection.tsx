
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';

interface FormData {
  name: string;
  hook_size: string;
  yarn_weight: string;
  details: string;
  featured_image_url: string | null;
}

interface ProjectImageSectionProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  userId: string;
  onImageDelete: () => void;
  onImageUpload: (imageUrl: string) => void;
}

export const ProjectImageSection = ({ 
  formData, 
  onFormDataChange, 
  userId, 
  onImageDelete, 
  onImageUpload 
}: ProjectImageSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Featured Image</Label>
      {formData.featured_image_url ? (
        <ImageViewer
          imageUrl={formData.featured_image_url}
          alt="Project featured image"
          className="w-full h-32"
          onDelete={onImageDelete}
        />
      ) : (
        <ImageUploader
          onImageUploaded={onImageUpload}
          userId={userId}
          folder="featured"
          className="w-full"
        />
      )}
    </div>
  );
};
