
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

export const useSwatchOperations = (userId: string) => {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSwatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSwatches(data || []);
    } catch (error: any) {
      console.error('Error fetching swatches:', error);
      toast({
        title: "Error",
        description: "Failed to load swatches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloneSwatch = async (swatch: Swatch) => {
    try {
      const clonedSwatchData = {
        title: `${swatch.title} (Copy)`,
        description: swatch.description,
        hook_size: swatch.hook_size,
        yarn_used: swatch.yarn_used,
        stitches_per_inch: swatch.stitches_per_inch,
        rows_per_inch: swatch.rows_per_inch,
        notes: swatch.notes,
        user_id: userId,
      };

      const { data: newSwatch, error: swatchError } = await supabase
        .from('swatches')
        .insert(clonedSwatchData)
        .select()
        .single();

      if (swatchError) throw swatchError;

      // Clone associated images
      const { data: originalImages, error: imagesError } = await supabase
        .from('swatch_images')
        .select('image_url, caption, is_primary')
        .eq('swatch_id', swatch.id);

      if (originalImages && originalImages.length > 0) {
        const imageClones = originalImages.map(img => ({
          swatch_id: newSwatch.id,
          image_url: img.image_url,
          caption: img.caption,
          is_primary: img.is_primary,
        }));

        const { error: imageCloneError } = await supabase
          .from('swatch_images')
          .insert(imageClones);

        if (imageCloneError) {
          console.error('Error cloning swatch images:', imageCloneError);
          // Don't throw here - swatch clone succeeded even if images failed
        }
      }

      toast({
        title: "Success",
        description: "Swatch cloned successfully",
      });

      fetchSwatches();
    } catch (error: any) {
      console.error('Error cloning swatch:', error);
      toast({
        title: "Error",
        description: "Failed to clone swatch",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSwatch = async (swatchId: string) => {
    try {
      // First delete any associated images
      const { error: imagesError } = await supabase
        .from('swatch_images')
        .delete()
        .eq('swatch_id', swatchId);

      if (imagesError) {
        console.error('Error deleting swatch images:', imagesError);
      }

      // Then delete the swatch
      const { error } = await supabase
        .from('swatches')
        .delete()
        .eq('id', swatchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Swatch deleted successfully",
      });

      fetchSwatches();
    } catch (error: any) {
      console.error('Error deleting swatch:', error);
      toast({
        title: "Error",
        description: "Failed to delete swatch",
        variant: "destructive",
      });
    }
  };

  return {
    swatches,
    loading,
    fetchSwatches,
    handleCloneSwatch,
    handleDeleteSwatch,
  };
};
