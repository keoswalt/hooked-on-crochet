
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SwatchBasicFieldsProps {
  formData: {
    title: string;
    description: string;
  };
  onChange: (field: string, value: string) => void;
}

export const SwatchBasicFields = ({ formData, onChange }: SwatchBasicFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Enter swatch title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe your swatch"
          rows={3}
        />
      </div>
    </>
  );
};
