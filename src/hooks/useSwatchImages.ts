
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSwatchImages = (swatchId: string) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('swatch_images')
          .select('image_url, is_primary')
          .eq('swatch_id', swatchId)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) throw error;

        const imageUrls = data?.map(img => img.image_url) || [];
        setImages(imageUrls);
      } catch (err: any) {
        console.error('Error fetching swatch images:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (swatchId) {
      fetchImages();
    }
  }, [swatchId]);

  return { images, loading, error };
};
