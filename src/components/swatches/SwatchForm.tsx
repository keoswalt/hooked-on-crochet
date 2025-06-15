
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SwatchBasicFields } from './SwatchBasicFields';
import { SwatchMeasurementFields } from './SwatchMeasurementFields';
import { SwatchYarnField } from './SwatchYarnField';
import { SwatchImageUpload } from './SwatchImageUpload';
import { SwatchNotesField } from './SwatchNotesField';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchFormProps {
  userId: string;
  swatch?: Swatch;
  onSave: () => void;
  onCancel: () => void;
}

export const SwatchForm = ({ userId, swatch, onSave, onCancel }: SwatchFormProps) => {
  const [formData, setFormData] = useState({
    title: swatch?.title || '',
    description: swatch?.description || '',
    hook_size: swatch?.hook_size || '',
    yarn_used: swatch?.yarn_used || '',
    stitches_per_inch: swatch?.stitches_per_inch?.toString() || '',
    rows_per_inch: swatch?.rows_per_inch?.toString() || '',
    notes: swatch?.notes || '',
    image_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Swatch title is required",
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
          .from('swatch-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('swatch-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const swatchData = {
        title: formData.title,
        description: formData.description || null,
        hook_size: formData.hook_size || null,
        yarn_used: formData.yarn_used || null,
        stitches_per_inch: formData.stitches_per_inch ? parseFloat(formData.stitches_per_inch) : null,
        rows_per_inch: formData.rows_per_inch ? parseFloat(formData.rows_per_inch) : null,
        notes: formData.notes || null,
        user_id: userId,
      };

      let swatchId = swatch?.id;

      if (swatch) {
        // Update existing swatch
        const { error } = await supabase
          .from('swatches')
          .update(swatchData)
          .eq('id', swatch.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Swatch updated successfully",
        });
      } else {
        // Create new swatch
        const { data, error } = await supabase
          .from('swatches')
          .insert(swatchData)
          .select()
          .single();

        if (error) throw error;
        swatchId = data.id;

        toast({
          title: "Success",
          description: "Swatch added successfully",
        });
      }

      // Handle image upload to swatch_images table if we have an image
      if (imageUrl && swatchId) {
        const { error: imageError } = await supabase
          .from('swatch_images')
          .insert({
            swatch_id: swatchId,
            image_url: imageUrl,
            is_primary: true,
          });

        if (imageError) {
          console.error('Error saving swatch image:', imageError);
        }
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving swatch:', error);
      toast({
        title: "Error",
        description: `Failed to ${swatch ? 'update' : 'add'} swatch`,
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

  const handleYarnUsedChange = (yarnUsed: string) => {
    setFormData(prev => ({ ...prev, yarn_used: yarnUsed }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SwatchBasicFields 
        formData={{
          title: formData.title,
          description: formData.description,
        }}
        onChange={handleChange}
      />

      <SwatchMeasurementFields 
        formData={{
          hook_size: formData.hook_size,
          stitches_per_inch: formData.stitches_per_inch,
          rows_per_inch: formData.rows_per_inch,
        }}
        onChange={handleChange}
      />

      <SwatchYarnField 
        yarnUsed={formData.yarn_used}
        onChange={handleYarnUsedChange}
      />

      <SwatchImageUpload 
        imageUrl={formData.image_url}
        onImageUrlChange={handleImageUrlChange}
        onFileChange={setSelectedFile}
        selectedFile={selectedFile}
      />

      <SwatchNotesField 
        notes={formData.notes}
        onChange={handleNotesChange}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : swatch ? 'Update Swatch' : 'Add Swatch'}
        </Button>
      </div>
    </form>
  );
};
