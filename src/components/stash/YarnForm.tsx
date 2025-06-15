
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface YarnFormProps {
  userId: string;
  yarn?: YarnStash;
  onSave: () => void;
  onCancel: () => void;
}

const YARN_WEIGHTS = [
  'Lace',
  'Light Fingering',
  'Fingering',
  'Sport',
  'DK',
  'Worsted',
  'Chunky',
  'Super Chunky',
];

export const YarnForm = ({ userId, yarn, onSave, onCancel }: YarnFormProps) => {
  const [formData, setFormData] = useState({
    name: yarn?.name || '',
    brand: yarn?.brand || '',
    color: yarn?.color || '',
    weight: yarn?.weight || '',
    material: yarn?.material || '',
    yardage: yarn?.yardage?.toString() || '',
    remaining_yardage: yarn?.remaining_yardage?.toString() || '',
    cost: yarn?.cost?.toString() || '',
    purchase_date: yarn?.purchase_date || '',
    image_url: yarn?.image_url || '',
    notes: yarn?.notes || '',
  });
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
      const yarnData = {
        name: formData.name,
        brand: formData.brand || null,
        color: formData.color || null,
        weight: formData.weight || null,
        material: formData.material || null,
        yardage: formData.yardage ? parseInt(formData.yardage) : null,
        remaining_yardage: formData.remaining_yardage ? parseInt(formData.remaining_yardage) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        purchase_date: formData.purchase_date || null,
        image_url: formData.image_url || null,
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
                <SelectItem key={weight} value={weight}>
                  {weight}
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

        <div>
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            placeholder="Enter cost"
          />
        </div>

        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => handleChange('purchase_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="Enter image URL"
          />
        </div>
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
