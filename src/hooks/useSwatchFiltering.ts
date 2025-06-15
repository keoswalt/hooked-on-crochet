
import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

export const useSwatchFiltering = (swatches: Swatch[]) => {
  const [filteredSwatches, setFilteredSwatches] = useState<Swatch[]>([]);

  useEffect(() => {
    setFilteredSwatches(swatches);
  }, [swatches]);

  return {
    filteredSwatches,
    setFilteredSwatches,
  };
};
