
import { ImageUploader } from '@/components/images/ImageUploader';

interface PatternImageSectionProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  userId: string;
}

export const PatternImageSection = ({ 
  imageUrl, 
  onImageChange, 
  userId 
}: PatternImageSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Featured Image</label>
      <ImageUploader
        imageUrl={imageUrl}
        onImageChange={onImageChange}
        bucket="pattern-images"
        folder={`${userId}/featured`}
      />
    </div>
  );
};
