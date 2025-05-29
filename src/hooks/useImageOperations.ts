
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteImage = async (imageUrl: string) => {
    try {
      setLoading(true);
      
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'project-images');
      if (bucketIndex === -1) {
        throw new Error('Invalid image URL');
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from('project-images')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Image deleted",
        description: "The image has been deleted successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteImage,
    loading,
  };
};
