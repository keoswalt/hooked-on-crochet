
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { YARN_WEIGHTS } from '@/utils/yarnWeights';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

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
  const [imageOption, setImageOption] = useState<'url' | 'upload'>('url');
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
      if (imageOption === 'upload' && selectedFile) {
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
        weight: formData.weight || null,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Yarn Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter yarn name"
            required
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Enter brand name"
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            placeholder="Enter color"
          />
        </div>

        <div>
          <Label htmlFor="weight">Weight</Label>
          <Select value={formData.weight} onValueChange={(value) => handleChange('weight', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select yarn weight" />
            </SelectTrigger>
            <SelectContent>
              {YARN_WEIGHTS.map((weight) => (
                <SelectItem key={weight.value} value={weight.value}>
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => handleChange('material', e.target.value)}
            placeholder="e.g., 100% Cotton"
          />
        </div>

        <div>
          <Label htmlFor="yardage">Total Yardage</Label>
          <Input
            id="yardage"
            type="number"
            value={formData.yardage}
            onChange={(e) => handleChange('yardage', e.target.value)}
            placeholder="Enter total yards"
          />
        </div>

        <div>
          <Label htmlFor="remaining_yardage">Remaining Yardage</Label>
          <Input
            id="remaining_yardage"
            type="number"
            value={formData.remaining_yardage}
            onChange={(e) => handleChange('remaining_yardage', e.target.value)}
            placeholder="Enter remaining yards"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label>Yarn Image</Label>
        <RadioGroup value={imageOption} onValueChange={(value: 'url' | 'upload') => setImageOption(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url" />
            <Label htmlFor="url">Image URL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Upload Image</Label>
          </div>
        </RadioGroup>

        {imageOption === 'url' ? (
          <Input
            placeholder="Enter image URL"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
          />
        ) : (
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any notes about this yarn"
          rows={3}
        />
      </div>

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
