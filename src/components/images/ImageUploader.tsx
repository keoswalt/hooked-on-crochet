
import { useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  userId: string;
  folder: string;
  accept?: string;
  className?: string;
  showButton?: boolean;
  uniqueId?: string;
}

export interface ImageUploaderRef {
  triggerUpload: () => void;
  resetInput: () => void;
}

const ImageUploaderComponent = forwardRef<ImageUploaderRef, ImageUploaderProps>(({ 
  onImageUploaded, 
  userId, 
  folder, 
  accept = "image/*",
  className = "",
  showButton = true,
  uniqueId
}, ref) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const inputId = `image-upload-${folder}${uniqueId ? `-${uniqueId}` : ''}`;

  const resetFileInput = () => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  useImperativeHandle(ref, () => ({
    triggerUpload: () => {
      resetFileInput(); // Clear input before triggering
      document.getElementById(inputId)?.click();
    },
    resetInput: resetFileInput
  }));

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      resetFileInput(); // Always clear input after upload attempt
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleButtonClick = () => {
    resetFileInput(); // Clear input before triggering
    document.getElementById(inputId)?.click();
  };

  return (
    <div className={className}>
      <Input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id={inputId}
      />
      {showButton && (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      )}
      {uploading && !showButton && (
        <div className="text-sm text-gray-500">Uploading...</div>
      )}
    </div>
  );
});

ImageUploaderComponent.displayName = 'ImageUploader';

export const ImageUploader = ImageUploaderComponent;
