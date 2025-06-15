
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface YarnBasicFieldsProps {
  formData: {
    name: string;
    brand: string;
    color: string;
  };
  onChange: (field: string, value: string) => void;
}

export const YarnBasicFields = ({ formData, onChange }: YarnBasicFieldsProps) => {
  return (
    <>
      {/* Full width yarn name field */}
      <div>
        <Label htmlFor="name">Yarn Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter yarn name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            placeholder="Enter brand name"
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => onChange('color', e.target.value)}
            placeholder="Enter color"
          />
        </div>
      </div>
    </>
  );
};
