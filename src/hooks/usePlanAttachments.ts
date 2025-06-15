
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

export const usePlanAttachments = (planId: string) => {
  const [attachedYarn, setAttachedYarn] = useState<YarnStash[]>([]);
  const [attachedSwatches, setAttachedSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAttachments = async () => {
    try {
      // Fetch attached yarn
      const { data: yarnData, error: yarnError } = await supabase
        .from('plan_yarn_attachments')
        .select(`
          yarn_id,
          yarn_stash (*)
        `)
        .eq('plan_id', planId);

      if (yarnError) throw yarnError;
      
      // Fetch attached swatches
      const { data: swatchData, error: swatchError } = await supabase
        .from('plan_swatch_attachments')
        .select(`
          swatch_id,
          swatches (*)
        `)
        .eq('plan_id', planId);

      if (swatchError) throw swatchError;

      setAttachedYarn(yarnData?.map(item => item.yarn_stash).filter(Boolean) as YarnStash[] || []);
      setAttachedSwatches(swatchData?.map(item => item.swatches).filter(Boolean) as Swatch[] || []);
    } catch (error: any) {
      console.error('Error fetching plan attachments:', error);
      toast({
        title: "Error",
        description: "Failed to load attachments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const attachYarn = async (yarnId: string) => {
    try {
      const { error } = await supabase
        .from('plan_yarn_attachments')
        .insert({
          plan_id: planId,
          yarn_id: yarnId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
        });

      if (error) throw error;
      
      await fetchAttachments();
      toast({
        title: "Success",
        description: "Yarn attached to plan",
      });
    } catch (error: any) {
      console.error('Error attaching yarn:', error);
      if (error.code === '23505') {
        toast({
          title: "Info",
          description: "This yarn is already attached to the plan",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to attach yarn",
          variant: "destructive",
        });
      }
    }
  };

  const detachYarn = async (yarnId: string) => {
    try {
      const { error } = await supabase
        .from('plan_yarn_attachments')
        .delete()
        .eq('plan_id', planId)
        .eq('yarn_id', yarnId);

      if (error) throw error;
      
      await fetchAttachments();
      toast({
        title: "Success",
        description: "Yarn detached from plan",
      });
    } catch (error: any) {
      console.error('Error detaching yarn:', error);
      toast({
        title: "Error",
        description: "Failed to detach yarn",
        variant: "destructive",
      });
    }
  };

  const attachSwatch = async (swatchId: string) => {
    try {
      const { error } = await supabase
        .from('plan_swatch_attachments')
        .insert({
          plan_id: planId,
          swatch_id: swatchId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
        });

      if (error) throw error;
      
      await fetchAttachments();
      toast({
        title: "Success",
        description: "Swatch attached to plan",
      });
    } catch (error: any) {
      console.error('Error attaching swatch:', error);
      if (error.code === '23505') {
        toast({
          title: "Info",
          description: "This swatch is already attached to the plan",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to attach swatch",
          variant: "destructive",
        });
      }
    }
  };

  const detachSwatch = async (swatchId: string) => {
    try {
      const { error } = await supabase
        .from('plan_swatch_attachments')
        .delete()
        .eq('plan_id', planId)
        .eq('swatch_id', swatchId);

      if (error) throw error;
      
      await fetchAttachments();
      toast({
        title: "Success",
        description: "Swatch detached from plan",
      });
    } catch (error: any) {
      console.error('Error detaching swatch:', error);
      toast({
        title: "Error",
        description: "Failed to detach swatch",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [planId]);

  return {
    attachedYarn,
    attachedSwatches,
    loading,
    attachYarn,
    detachYarn,
    attachSwatch,
    detachSwatch,
    refreshAttachments: fetchAttachments,
  };
};
