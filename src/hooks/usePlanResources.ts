
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PlanResource = Database['public']['Tables']['plan_resources']['Row'];

export const usePlanResources = (planId: string) => {
  const [resources, setResources] = useState<PlanResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_resources')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error('Error fetching plan resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resource: {
    url: string;
    title?: string;
    description?: string;
    resource_type?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('plan_resources')
        .insert({
          plan_id: planId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          ...resource,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchResources();
      toast({
        title: "Success",
        description: "Resource added successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding resource:', error);
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
    }
  };

  const updateResource = async (resourceId: string, updates: {
    url?: string;
    title?: string;
    description?: string;
    resource_type?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('plan_resources')
        .update(updates)
        .eq('id', resourceId);

      if (error) throw error;
      
      await fetchResources();
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      });
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('plan_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
      
      await fetchResources();
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchResources();
  }, [planId]);

  return {
    resources,
    loading,
    addResource,
    updateResource,
    deleteResource,
    refreshResources: fetchResources,
  };
};
