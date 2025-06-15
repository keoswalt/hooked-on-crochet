
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PlanImage = Database['public']['Tables']['plan_images']['Row'];

export const usePlanImages = (planId: string) => {
  const [images, setImages] = useState<PlanImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_images')
        .select('*')
        .eq('plan_id', planId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error('Error fetching plan images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addImage = async (imageUrl: string, isFeatured: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('plan_images')
        .insert({
          plan_id: planId,
          image_url: imageUrl,
          is_featured: isFeatured,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Image added successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding image:', error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    }
  };

  const setFeaturedImage = async (imageId: string) => {
    try {
      // First, remove featured status from all images
      await supabase
        .from('plan_images')
        .update({ is_featured: false })
        .eq('plan_id', planId);

      // Then set the selected image as featured
      const { error } = await supabase
        .from('plan_images')
        .update({ is_featured: true })
        .eq('id', imageId);

      if (error) throw error;
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Featured image updated",
      });
    } catch (error: any) {
      console.error('Error setting featured image:', error);
      toast({
        title: "Error",
        description: "Failed to update featured image",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('plan_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      await fetchImages();
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [planId]);

  return {
    images,
    loading,
    addImage,
    setFeaturedImage,
    deleteImage,
    refreshImages: fetchImages,
  };
};
