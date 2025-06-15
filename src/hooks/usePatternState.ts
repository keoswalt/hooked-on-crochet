
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Pattern = Database['public']['Tables']['patterns']['Row'];

export const usePatternState = (user: User) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (error: any) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [user.id]);

  return {
    patterns,
    selectedPattern,
    setSelectedPattern,
    loading,
    fetchPatterns,
  };
};
