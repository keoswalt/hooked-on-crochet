
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { YarnBasicFields } from './YarnBasicFields';
import { YarnDetailsFields } from './YarnDetailsFields';
import { YarnImageUpload } from './YarnImageUpload';
import { YarnNotesField } from './YarnNotesField';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface YarnFormProps {
  userId: string;
  yarn?: YarnStash;
  onSave: () => void;
  onCancel: () => void;
}

export const YarnForm = ({ userId, yarn, onSave, onCancel }: YarnFormProps) => {
  const [formData, setFormData] = useState({
    name: yarn?.name || '',
    brand: yarn?.brand || '',
    color: yarn?.color || '',
    weight: yarn?.weight || '',
    material: yarn?.material || '',
    yardage: yarn?.yardage?.toString() || '',
    remaining_yardage: yarn?.remaining_yardage?.toString() || '',
    image_url: yarn?.image_url || '',
    notes: yarn?.notes || '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Yarn name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      // Handle file upload if user selected upload option and has a file
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('yarn-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('yarn-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const yarnData = {
        name: formData.name,
        brand: formData.brand || null,
        color: formData.color || null,
        weight: formData.weight ? (formData.weight as YarnWeight) : null,
        material: formData.material || null,
        yardage: formData.yardage ? parseInt(formData.yardage) : null,
        remaining_yardage: formData.remaining_yardage ? parseInt(formData.remaining_yardage) : null,
        image_url: imageUrl || null,
        notes: formData.notes || null,
        user_id: userId,
      };

      if (yarn) {
        // Update existing yarn
        const { error } = await supabase
          .from('yarn_stash')
          .update(yarnData)
          .eq('id', yarn.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Yarn updated successfully",
        });
      } else {
        // Create new yarn
        const { error } = await supabase
          .from('yarn_stash')
          .insert(yarnData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Yarn added successfully",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving yarn:', error);
      toast({
        title: "Error",
        description: `Failed to ${yarn ? 'update' : 'add'} yarn`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <YarnBasicFields 
        formData={{
          name: formData.name,
          brand: formData.brand,
          color: formData.color,
        }}
        onChange={handleChange}
      />

      <YarnDetailsFields 
        formData={{
          weight: formData.weight,
          material: formData.material,
          yardage: formData.yardage,
          remaining_yardage: formData.remaining_yardage,
        }}
        onChange={handleChange}
      />

      <YarnImageUpload 
        imageUrl={formData.image_url}
        onImageUrlChange={handleImageUrlChange}
        onFileChange={setSelectedFile}
        selectedFile={selectedFile}
      />

      <YarnNotesField 
        notes={formData.notes}
        onChange={handleNotesChange}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : yarn ? 'Update Yarn' : 'Add Yarn'}
        </Button>
      </div>
    </form>
  );
};
